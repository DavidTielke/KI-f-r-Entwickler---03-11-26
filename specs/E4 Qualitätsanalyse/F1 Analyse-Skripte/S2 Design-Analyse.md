# Design-Analyse

## Meta
- **State:** Implemented

## User Story
Als Entwickler möchte ich das Software-Design des Backends mit einem Befehl gegen die NDepend-Regeldatei prüfen, damit ich mit minimaler Ausgabe erkenne, ob das Design richtlinienkonform ist und welche Stellen ich korrigieren muss.

## Description
`python harness/analyse_swd.py` baut das Backend und prüft es mit NDepend gegen die Regeldatei aus dem Harness. Die Ausgabe enthält nur das Ergebnis und die zum Korrigieren nötigen Angaben.

## Akzeptanzkriterien

### Regelgrundlage
- Die Prüfung verwendet die Regeldatei `harness/_design.ndrules`.
- Es werden ausschließlich die Regeln aus dieser Datei ausgeführt.
- Die Treffer einer Regel werden vollständig ausgewertet, ohne die Kürzung des NDepend-Reports.

### Build
- Vor der Analyse wird das Backend gebaut.
- Mit `--no-build` wird die vorhandene Assembly analysiert.
- Mit `--build-only` wird nur gebaut.
- Kompiliert das Backend nicht, beginnt die Ausgabe mit `build ERROR`.
- Jeder Compilerfehler wird einmal mit Datei, Zeile, Fehlercode und Text ausgegeben.

### Ergebnis
- Ohne Verstöße lautet die Ausgabe `swd OK` mit der Anzahl der geprüften Regeln.
- Ohne Verstöße ist der Exit-Code `0`.
- Mit Verstößen beginnt die Ausgabe mit `swd FAIL` und dem Verhältnis von verletzten zu geprüften Regeln.
- Mit Verstößen ist der Exit-Code `1`.

### Befunde
- Jede verletzte Regel wird mit ihrem Namen ausgegeben.
- Hat die verletzte Regel eine Beschreibung, steht sie hinter dem Namen.
- Jeder Treffer nennt das betroffene Code-Element.
- Jeder Treffer nennt Datei und Zeile, sofern NDepend sie liefert.
- Nennt eine Regel das auslösende Element in einer Zusatzspalte, wird es hinter dem Treffer ausgegeben.

### Begrenzung
- Standardmäßig werden höchstens 100 Treffer ausgegeben.
- Mit `--max {n}` werden höchstens `n` Treffer ausgegeben.
- Mit `--max 0` werden alle Treffer ausgegeben.
- Bei gekürzter Ausgabe nennt die letzte Zeile die Anzahl der nicht ausgegebenen Treffer.

### Fehlerfälle
- Fehlt die Regeldatei, beginnt die Ausgabe mit `swd ERROR`.
- Fehlt NDepend, beginnt die Ausgabe mit `swd ERROR`.
- Liefert NDepend kein Ergebnis, beginnt die Ausgabe mit `swd ERROR`.
- Lädt NDepend keine Regel, beginnt die Ausgabe mit `swd ERROR`.
- Ist eine Regel nicht ausführbar, beginnt die Ausgabe mit `swd ERROR`.
- Eine nicht ausführbare Regel wird mit ihrem Namen und der Fehlermeldung ausgegeben.
- In jedem Fehlerfall und bei einem fehlgeschlagenen Build ist der Exit-Code `2`.
- Ein Ergebnis aus einem früheren Lauf wird nie als aktuelles Ergebnis ausgegeben.
