#!/usr/bin/env python3
"""Führt analyse_code.py und analyse_swd.py aus und gibt deren Kurzergebnisse aus.

Exit: 0 = konform, 1 = Verstöße, 2 = Prüfung nicht möglich (nie als bestanden werten).
"""
import argparse
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent


def start(script, *args):
    return subprocess.Popen(
        [sys.executable, str(HERE / script), *args],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        stdin=subprocess.DEVNULL,
    )


def finish(process):
    output = process.communicate()[0]
    sys.stdout.buffer.write(output)
    sys.stdout.buffer.flush()
    return process.returncode


def main():
    parser = argparse.ArgumentParser(description="Code- und Designprüfung des Backends")
    parser.add_argument("--max", default="100", help="maximal ausgegebene Treffer je Prüfung (0 = alle)")
    parser.add_argument("--no-build", action="store_true", help="vorhandene Assembly analysieren")
    args = parser.parse_args()

    # Vorab einmal bauen: So greifen die parallelen Prüfungen nie gleichzeitig mit dem Build auf obj/ zu,
    # und bei Compilerfehlern entfallen die Analysen samt ihren Folgefehlern.
    if not args.no_build:
        build_result = finish(start("analyse_swd.py", "--build-only"))
        if build_result != 0:
            return build_result

    processes = [
        start("analyse_code.py", "--max", args.max),
        start("analyse_swd.py", "--no-build", "--max", args.max),
    ]
    return max([finish(process) for process in processes])


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as exc:  # Ein Absturz darf nie wie ein normaler Befund (Exit 1) aussehen.
        print(f"all ERROR {type(exc).__name__}: {str(exc)[:300]}")
        sys.exit(2)
