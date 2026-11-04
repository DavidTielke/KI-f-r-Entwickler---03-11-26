#!/usr/bin/env python3
"""ReSharper-Prüfung des Backends gegen die Regeldatei aus dem Harness.

Gibt nur das Ergebnis und die zum Fixen nötigen Stellen aus.
Exit: 0 = konform, 1 = Issues, 2 = Prüfung nicht möglich (nie als bestanden werten).
"""
import argparse
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parent.parent
PROJECT = ROOT / "code" / "backend" / "Backend.csproj"
RULES = ROOT / "harness" / "PersonManager.sln.DotSettings"
# Außerhalb des Repos: Caches sollen weder OneDrive noch Git belasten.
WORK = Path(tempfile.gettempdir()) / f"analyse-{hashlib.md5(str(ROOT).encode()).hexdigest()[:8]}" / "resharper"
TIMEOUT = 600
DEFAULT_MAX = 100

# Spart bei Namensverstößen pro Treffer rund 15 Wörter, ohne Information zu verlieren.
NAMING = re.compile(r"Name '(.+?)' does not match rule '.*?'\. Suggested name is '(.+?)'\.")


def run(cmd, log):
    """Startet ein Tool mit Ausgabe in eine Datei: Pipes können an Build-Servern hängen bleiben."""
    with open(log, "wb") as out:
        return subprocess.run(
            cmd, stdout=out, stderr=subprocess.STDOUT, stdin=subprocess.DEVNULL, timeout=TIMEOUT
        ).returncode


def fail(message, log=None):
    print(f"code ERROR {message}")
    if log and log.exists():
        lines = [line.strip() for line in log.read_text("utf-8", "replace").splitlines() if line.strip()]
        for line in lines[-5:]:
            print(f" {line[:200]}")
    return 2


def restore_if_stale(log):
    """InspectCode läuft ohne Build, braucht aber aktuelle NuGet-Referenzen."""
    assets = PROJECT.parent / "obj" / "project.assets.json"
    if assets.exists() and assets.stat().st_mtime >= PROJECT.stat().st_mtime:
        return 0
    return run(["dotnet", "restore", str(PROJECT), "-v", "q", "--nologo"], log)


def inspect(jb, sarif, log):
    return run(
        [
            jb, "inspectcode", str(PROJECT),
            f"--settings={RULES}",
            "--no-buildin-settings",  # Nur die Harness-Regeln zählen, keine persönlichen Einstellungen.
            "--no-build",
            "--format=Sarif",
            f"--output={sarif}",
            f"--caches-home={WORK / 'cache'}",
            "--no-updates",
            "--verbosity=WARN",
        ],
        log,
    )


def to_issue(result):
    location = (result.get("locations") or [{}])[0].get("physicalLocation", {})
    text = result.get("message", {}).get("text", "")
    naming = NAMING.fullmatch(text)
    return {
        "error": result.get("level") == "error",
        "path": unquote(location.get("artifactLocation", {}).get("uri", "?")),
        "line": location.get("region", {}).get("startLine", 0),
        "rule": result.get("ruleId", "?"),
        "text": f"{naming[1]}>{naming[2]}" if naming else text,
    }


def report(issues, limit):
    # Compilerfehler zuerst: Sie verursachen oft Folge-Issues und dürfen nie abgeschnitten werden.
    issues.sort(key=lambda issue: (not issue["error"], issue["path"], issue["line"]))
    shown = issues[:limit] if limit else issues

    files = {}
    for issue in shown:
        texts = files.setdefault(issue["path"], {}).setdefault(issue["rule"], {})
        texts.setdefault(issue["text"], []).append(str(issue["line"]))

    base = os.path.relpath(PROJECT.parent, ROOT).replace(os.sep, "/")
    print(f"code FAIL {len(issues)} Issues, Pfade relativ zu {base}")
    for path, rules in files.items():
        print(path)
        for rule, texts in rules.items():
            print(f" {rule}: " + "; ".join(f"{','.join(lines)} {text}" for text, lines in texts.items()))
    if len(shown) < len(issues):
        print(f"+{len(issues) - len(shown)} weitere (--max 0 = alle)")


def main():
    parser = argparse.ArgumentParser(description="ReSharper-Prüfung gegen die Harness-Regeldatei")
    parser.add_argument("--max", type=int, default=DEFAULT_MAX, help="maximal ausgegebene Issues (0 = alle)")
    args = parser.parse_args()

    jb = shutil.which("jb") or shutil.which(str(Path.home() / ".dotnet" / "tools" / "jb"))
    if not jb:
        return fail("jb nicht gefunden (dotnet tool install -g JetBrains.ReSharper.GlobalTools)")
    if not RULES.is_file():
        return fail(f"Regeldatei fehlt: {RULES}")

    WORK.mkdir(parents=True, exist_ok=True)
    sarif, log = WORK / "result.sarif", WORK / "tool.log"
    sarif.unlink(missing_ok=True)  # Ein altes Ergebnis darf nie als aktuelles durchgehen.

    if restore_if_stale(log) != 0:
        return fail("dotnet restore fehlgeschlagen", log)
    exit_code = inspect(jb, sarif, log)
    if exit_code != 0 or not sarif.is_file():
        return fail(f"InspectCode Exit {exit_code}", log)

    result = json.loads(sarif.read_text("utf-8-sig"))["runs"][0]
    if not all(item.get("executionSuccessful", True) for item in result.get("invocations", [])):
        return fail("InspectCode meldet Abbruch", log)

    issues = [to_issue(item) for item in result.get("results", [])]
    if not issues:
        print("code OK")
        return 0
    report(issues, args.max)
    return 1


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    try:
        sys.exit(main())
    except Exception as exc:  # Ein Absturz darf nie wie ein normaler Befund (Exit 1) aussehen.
        print(f"code ERROR {type(exc).__name__}: {str(exc)[:300]}")
        sys.exit(2)
