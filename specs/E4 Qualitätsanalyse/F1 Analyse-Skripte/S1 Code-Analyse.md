# Code-Analyse

## Meta
- **State:** Implemented

## User Story
Als Entwickler möchte ich den Backend-Code mit einem Befehl gegen die ReSharper-Regeldatei prüfen, damit ich mit minimaler Ausgabe erkenne, ob der Code richtlinienkonform ist und welche Stellen ich korrigieren muss.

## Description
`python harness/analyse_code.py` prüft das Backend mit ReSharper InspectCode gegen die Regeldatei aus dem Harness. Die Ausgabe enthält nur das Ergebnis und die zum Korrigieren nötigen Angaben.

## Akzeptanzkriterien

### Regelgrundlage
- Die Prüfung verwendet die Regeldatei `harness/PersonManager.sln.DotSettings`.
- Persönliche, globale und Solution-Einstellungen fließen nicht in das Ergebnis ein.
- Befunde ab dem Schweregrad `SUGGESTION` zählen als Issues.

### Ergebnis
- Ohne Issues lautet die Ausgabe `code OK`.
- Ohne Issues ist der Exit-Code `0`.
- Mit Issues beginnt die Ausgabe mit `code FAIL` und der Gesamtzahl der Issues.
- Mit Issues ist der Exit-Code `1`.

### Befunde
- Befunde sind nach Datei gruppiert.
- Dateipfade sind relativ zum Backend-Verzeichnis, das die erste Ausgabezeile nennt.
- Jeder Befund nennt die Zeile und die Regel.
- Befunde mit derselben Regel und demselben Text in einer Datei werden zu einem Eintrag mit allen Zeilennummern zusammengefasst.
- Ein Namensverstoß wird im Format `{ist}>{soll}` ausgegeben.
- Compilerfehler stehen vor allen anderen Befunden.

### Begrenzung
- Standardmäßig werden höchstens 100 Issues ausgegeben.
- Mit `--max {n}` werden höchstens `n` Issues ausgegeben.
- Mit `--max 0` werden alle Issues ausgegeben.
- Bei gekürzter Ausgabe nennt die letzte Zeile die Anzahl der nicht ausgegebenen Issues.
- Die Gesamtzahl in der ersten Zeile enthält auch die nicht ausgegebenen Issues.

### Fehlerfälle
- Fehlt die Regeldatei, beginnt die Ausgabe mit `code ERROR`.
- Fehlt `jb`, beginnt die Ausgabe mit `code ERROR`.
- Schlägt InspectCode fehl, beginnt die Ausgabe mit `code ERROR`.
- In jedem Fehlerfall ist der Exit-Code `2`.
- Ein Ergebnis aus einem früheren Lauf wird nie als aktuelles Ergebnis ausgegeben.
