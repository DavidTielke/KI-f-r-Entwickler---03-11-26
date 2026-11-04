#!/usr/bin/env python3
"""NDepend-Prüfung des Software-Designs gegen die Regeldatei aus dem Harness.

Gibt nur das Ergebnis und die zum Fixen nötigen Stellen aus.
Exit: 0 = konform, 1 = Verstöße, 2 = Prüfung nicht möglich (nie als bestanden werten).
"""
import argparse
import hashlib
import os
import re
import shutil
import subprocess
import sys
import tempfile
import xml.etree.ElementTree as ET
from pathlib import Path
from xml.sax.saxutils import quoteattr

ROOT = Path(__file__).resolve().parent.parent
PROJECT = ROOT / "code" / "backend" / "Backend.csproj"
RULES = ROOT / "harness" / "_design.ndrules"
NDEPEND = Path(r"C:\Program Files (x86)\NDepend_2026\NDepend.Console.exe")
# Außerhalb des Repos: Analyseergebnisse sollen weder OneDrive noch Git belasten.
WORK = Path(tempfile.gettempdir()) / f"analyse-{hashlib.md5(str(ROOT).encode()).hexdigest()[:8]}" / "ndepend"
TIMEOUT = 600
DEFAULT_MAX = 100

# Ohne NbItems* kürzt NDepend die Treffer je Regel; ohne leeres <Queries /> kämen Standardregeln dazu.
NDPROJ = """<?xml version="1.0" encoding="utf-8" standalone="yes"?>
<NDepend AppName="swd" Platform="DotNet">
  <OutputDir KeepXmlFiles="True">.\\out</OutputDir>
  <IDEFiles><IDEFile FilePath={project} Filters="" Configuration="DEBUG|AnyCPU" /></IDEFiles>
  <Assemblies />
  <Dirs />
  <MergeCodeGeneratedByCompiler>True</MergeCodeGeneratedByCompiler>
  <CompressNDar>False</CompressNDar>
  <ZipSourceFiles>False</ZipSourceFiles>
  <ForceReturnZeroExitCode>True</ForceReturnZeroExitCode>
  <Report Kind="0" SectionsEnabled="110591" XslPath="" Flags="4455424"
          NbItemsToUnfold="100000" NbItemsPerRule="100000" MaxNbSourceFiles="0" />
  <IssueImport ResolveSarifInSolutionDirectories="False" />
  <RuleFiles />
  <ProjectRules AreActive="True" QueryPersistenceKind="PersistOnlyQueryIdForUntouchedQueries" />
  <Queries />
</NDepend>
"""

BUILD_ERROR = re.compile(r"^(.+?)\((\d+),\d+\): (?:error|Fehler) (\w+): (.*?)(?: \[.*\])?$")
DESCRIPTION = re.compile(r"<Name>(.*?)</Name>\s*// <Description>(.*?)</Description>")
ELEMENT = re.compile(r"^([A-Z]+):(.*?)(?:§(.*))?$", re.DOTALL)
SOURCE = re.compile(r":(.+?)\.html(?:#L(\d+))?$")
LINE = re.compile(r"(?:#L|\?ln=)(\d+)")


def run(cmd, log, env=None):
    """Startet ein Tool mit Ausgabe in eine Datei: Pipes können an Build-Servern hängen bleiben."""
    with open(log, "wb") as out:
        return subprocess.run(
            cmd, stdout=out, stderr=subprocess.STDOUT, stdin=subprocess.DEVNULL, timeout=TIMEOUT, env=env
        ).returncode


def last_lines(log):
    if not log.exists():
        return []
    lines = [line.strip() for line in log.read_text("utf-8", "replace").splitlines() if line.strip()]
    return [line[:200] for line in lines[-5:]]


def fail(message, details=()):
    print(f"swd ERROR {message}")
    for detail in details:
        print(f" {detail}")
    return 2


def relative(path):
    prefix = str(PROJECT.parent) + os.sep
    return path[len(prefix):].replace(os.sep, "/") if path.startswith(prefix) else path


def build():
    """Baut das Backend, denn NDepend analysiert die kompilierte Assembly."""
    log = WORK / "build.log"
    env = {**os.environ, "DOTNET_CLI_UI_LANGUAGE": "en", "DOTNET_CLI_FORCE_UTF8_ENCODING": "1"}
    if run(["dotnet", "build", str(PROJECT), "--nologo", "-v", "q", "-clp:ErrorsOnly"], log, env) == 0:
        return 0

    lines = log.read_text("utf-8", "replace").splitlines()
    matches = filter(None, (BUILD_ERROR.match(line.strip()) for line in lines))
    # MSBuild meldet jeden Fehler doppelt: einmal live und einmal in der Zusammenfassung.
    errors = dict.fromkeys(f"{relative(m[1])}:{m[2]} {m[3]} {m[4]}" for m in matches)
    print("build ERROR Backend kompiliert nicht")
    for error in errors or last_lines(log):
        print(f" {error}")
    return 2


def analyse():
    """Liefert den Pfad zur Regelergebnis-Datei oder None, wenn NDepend keine erzeugt hat."""
    shutil.rmtree(WORK / "out", ignore_errors=True)  # Ein altes Ergebnis darf nie als aktuelles durchgehen.
    ndproj = WORK / "swd.ndproj"
    ndproj.write_text(NDPROJ.format(project=quoteattr(str(PROJECT))), "utf-8")
    exit_code = run(
        [str(NDEPEND), str(ndproj), "/RuleFiles", str(RULES), "/DontPersistHistoricAnalysisResult", "/Concurrent"],
        WORK / "tool.log",
    )
    result = WORK / "out" / "XmlFilesUsedToBuildReport" / "CodeRuleResult.xml"
    return result if exit_code == 0 and result.is_file() else None


def source_index():
    """NDepend nennt nur Dateinamen; bei gleichnamigen Dateien bleibt es beim Namen statt zu raten."""
    index = {}
    for path in PROJECT.parent.rglob("*.cs"):
        rel = path.relative_to(PROJECT.parent)
        if rel.parts[0] not in ("bin", "obj"):
            index[path.name] = None if path.name in index else rel.as_posix()
    return index


def short_name(item):
    """'GET:Ns.Typ.get_X( )§:Typ.cs.html#L9' -> 'get_X:9'."""
    match = ELEMENT.match(item.strip())
    if not match:
        return item.strip()
    name = match[2].replace(" ", "")
    if match[1] != "N":
        name = re.sub(r"\(.*\)$", "", name).rsplit(".", 1)[-1]
    line = LINE.search(match[3] or "")
    return f"{name}:{line[1]}" if line else name


def details(row):
    """Zusatzspalten nennen das eigentlich auslösende Element, z. B. die konkrete Methode."""
    names = []
    for val in row.findall("Val"):
        if val.text and val.text.strip():
            parts = val.text.split(";")
            # Der erste Teil ist nur ein Zähler wie '2 types', sofern Elemente folgen.
            names += [short_name(part) for part in parts[1:] or parts]
    return f" -> {', '.join(names)}" if names else ""


def format_row(row, index):
    match = ELEMENT.match(row.get("Name", ""))
    if not match:
        return row.get("Name", "") + details(row)
    name = match[2].replace(" ", "")
    source = SOURCE.search(match[3] or "")
    if not source:
        return name + details(row)
    path = index.get(source[1]) or source[1]
    where = f"{path}:{source[2]}" if source[2] else path
    return f"{where} {name}{details(row)}"


def report(violated, nb_rules, limit):
    index = source_index()
    descriptions = dict(DESCRIPTION.findall(RULES.read_text("utf-8")))
    base = os.path.relpath(PROJECT.parent, ROOT).replace(os.sep, "/")
    print(f"swd FAIL {len(violated)}/{nb_rules} Regeln verletzt, Pfade relativ zu {base}")

    shown = hidden = 0
    for query in violated:
        rows = [row for row in query.findall("Rows/Row") if row.get("FullName") != "Stat"]
        if limit and shown >= limit:
            hidden += len(rows)
            continue
        name = query.get("Name", "?")
        description = descriptions.get(name)
        print(f"{name} | {description}" if description else name)
        for row in rows:
            if limit and shown >= limit:
                hidden += 1
                continue
            print(f" {format_row(row, index)}")
            shown += 1
    if hidden:
        print(f"+{hidden} weitere (--max 0 = alle)")


def main():
    parser = argparse.ArgumentParser(description="NDepend-Prüfung gegen die Harness-Regeldatei")
    parser.add_argument("--max", type=int, default=DEFAULT_MAX, help="maximal ausgegebene Treffer (0 = alle)")
    parser.add_argument("--no-build", action="store_true", help="vorhandene Assembly analysieren")
    parser.add_argument("--build-only", action="store_true", help="nur bauen und Compilerfehler melden")
    args = parser.parse_args()

    if not NDEPEND.is_file():
        return fail(f"NDepend nicht gefunden: {NDEPEND}")
    if not RULES.is_file():
        return fail(f"Regeldatei fehlt: {RULES}")

    WORK.mkdir(parents=True, exist_ok=True)
    if not args.no_build and build() != 0:
        return 2
    if args.build_only:
        return 0

    result = analyse()
    if result is None:
        return fail("NDepend hat kein Ergebnis geliefert", last_lines(WORK / "tool.log"))

    root = ET.parse(result).getroot()
    nb_rules = int(root.get("NbRules", "0"))
    # Bei fehlerhaften Regeln oder 0 geladenen Regeln meldet NDepend Exit 0: kein bestandener Lauf.
    if nb_rules == 0:
        return fail("NDepend hat keine Regeln geladen")
    queries = list(root.iter("Query"))
    broken = [query for query in queries if query.get("Status") == "Error"]
    if broken or int(root.get("NbErrors", "0")):
        details_ = [f"{query.get('Name')}: {query.get('ErrorDesc', '')[:200]}" for query in broken]
        return fail("Regeln nicht ausführbar", details_)

    violated = [query for query in queries if query.get("Status", "").startswith("RuleWarn")]
    expected = int(root.get("NbWarns", "0")) + int(root.get("NbWarnsCritical", "0"))
    if len(violated) != expected:
        return fail(f"Ergebnis unvollständig: {len(violated)} von {expected} verletzten Regeln gefunden")
    if not violated:
        print(f"swd OK {nb_rules} Regeln")
        return 0
    report(violated, nb_rules, args.max)
    return 1


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    try:
        sys.exit(main())
    except Exception as exc:  # Ein Absturz darf nie wie ein normaler Befund (Exit 1) aussehen.
        print(f"swd ERROR {type(exc).__name__}: {str(exc)[:300]}")
        sys.exit(2)
