# Selbstständige Nachbesserung

## Meta
- **State:** Implemented

## User Story
Als Fachbereich möchte ich, dass die KI Fehler beim Bau und bei der Auslieferung selbst behebt, damit eine Umsetzung nicht an behebbaren technischen Problemen scheitert.

## Description
Scheitert der Bau oder die Auslieferung, erhält die KI den Befund und das Protokoll und bessert nach. Danach prüft die Factory erneut. Nach zwei erfolglosen Versuchen endet der Auftrag mit einem Fehler.

## Akzeptanzkriterien
### Bau
- Scheitert `docker compose build`, startet das Backend eine Nachbesserung.
- Das Protokoll zeigt „Der Bau ist fehlgeschlagen. Die KI bessert nach.“.
- Nach jeder Nachbesserung wiederholt das Backend den Bau.
- Das Backend führt je Bauschritt höchstens 2 Nachbesserungen durch.

### Auslieferung
- Scheitert die Auslieferung oder die Betriebsprüfung, startet das Backend eine Nachbesserung.
- Das Protokoll zeigt „Die Auslieferung war nicht erfolgreich. Die KI bessert nach.“.
- Der Auftrag kehrt für die Nachbesserung in die Phase „Prüfung“ zurück.
- Nach der Nachbesserung baut das Backend die Version erneut.
- Liegen danach Änderungen vor, erzeugt das Backend die Git-Version `umsetzung: {id} nachbesserung`.
- Nach der Git-Version zeigt `commit` auf die Nachbesserung.
- `commits` enthält danach zusätzlich die Nachbesserung.
- Nach der Git-Version beschreibt `changes` die Nachbesserung.
- Danach liefert das Backend erneut aus und prüft erneut den Betrieb.
- Das Backend führt für die Auslieferung höchstens 2 Nachbesserungen durch.

### KI
- Die KI arbeitet bei der Nachbesserung mit dem Rechteprofil `build`.
- Die KI arbeitet mit dem Modell aus `buildModel`.
- Die KI arbeitet mit der Arbeitstiefe `high`.
- Eine Nachbesserung endet spätestens nach 30 Minuten.
- Die KI erhält den Befund und die letzten 6000 Zeichen des Protokolls.
- Nach einer gescheiterten Betriebsprüfung enthält das Protokoll die Zeilen aus `docker compose logs`.
- Die KI erhält die Vorgabe, Befehle nur mit dem Werkzeug Bash und nur mit `npm`, `npx` und `dotnet` auszuführen.
- Die KI erhält die Vorgabe, weder git noch docker auszuführen.
- Die KI erhält die Vorgabe, nichts unter `code/factory`, `ideas/` und `harness/` zu ändern.

### Anzeige und Abschluss
- Das Feld `repairs` zählt alle Nachbesserungen eines Auftrags.
- Die Kennzahl „Nachbesserungen“ ist sichtbar, sobald `repairs` größer als 0 ist.
- Nach einem Abbruch startet keine weitere Nachbesserung.
- Sind die Nachbesserungen ausgeschöpft, endet der Auftrag mit dem letzten Befund.
