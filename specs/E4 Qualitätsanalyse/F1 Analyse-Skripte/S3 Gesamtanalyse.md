# Gesamtanalyse

## Meta
- **State:** Implemented

## User Story
Als Entwickler möchte ich Code- und Design-Analyse mit einem Befehl ausführen, damit ich schnell ein Gesamtergebnis erhalte, ohne beide Analysen einzeln zu starten.

## Description
`python harness/analyse_all.py` baut das Backend einmal und führt danach Code-Analyse (siehe S1) und Design-Analyse (siehe S2) gleichzeitig aus. Die Ausgabe besteht aus den Kurzergebnissen beider Analysen.

## Akzeptanzkriterien

### Ablauf
- Vor den Analysen wird das Backend genau einmal gebaut.
- Mit `--no-build` entfällt der Build.
- Kompiliert das Backend nicht, werden die Analysen nicht gestartet.
- Code-Analyse und Design-Analyse laufen gleichzeitig.

### Ausgabe
- Die Ausgabe enthält das Ergebnis der Code-Analyse.
- Die Ausgabe enthält das Ergebnis der Design-Analyse.
- Das Ergebnis der Code-Analyse steht vor dem Ergebnis der Design-Analyse.
- Mit `--max {n}` gilt die Begrenzung für jede der beiden Analysen.

### Exit-Code
- Sind beide Analysen ohne Befund, ist der Exit-Code `0`.
- Hat mindestens eine Analyse Befunde und keine einen Fehler, ist der Exit-Code `1`.
- Schlägt der Build oder eine Analyse fehl, ist der Exit-Code `2`.
