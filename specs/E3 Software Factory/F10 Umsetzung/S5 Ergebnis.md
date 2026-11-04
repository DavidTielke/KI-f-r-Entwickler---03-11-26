# Ergebnis

## Meta
- **State:** Implemented

## User Story
Als Fachbereich möchte ich nach einem Auftrag sehen, was entstanden ist und welchen Aufwand er verursacht hat, damit ich das Ergebnis direkt prüfen kann.

## Description
Nach dem Abschluss fasst eine Karte das Ergebnis in Fachsprache zusammen und führt zur Anwendung oder zu den neuen Anforderungen. Scheitert ein Auftrag, nennt die Seite den Grund. Die Eckdaten sind jederzeit sichtbar.

## Akzeptanzkriterien
### Ergebnis-Karte
- Die Karte ist nur bei den Status `done` und `partial` sichtbar.
- Die Karte zeigt die Dachzeile „Ergebnis“.
- Bei `done` zeigt die Karte den Titel „Der Auftrag ist abgeschlossen.“.
- Bei `partial` zeigt die Karte den Titel „Der Auftrag ist teilweise abgeschlossen.“.
- Die Karte zeigt das Feld `summary`, wenn es Inhalt hat.
- Bei den Auftragstypen `delivery` und `revert` führt der Button „Anwendung öffnen“ in einem neuen Tab zu `appUrl`.
- Beim Auftragstyp `transfer` führt der Button „Anforderungen prüfen“ zu `#/anforderungen?filter=offen`.

### Fehler
- Das UI zeigt das Feld `error` eines gescheiterten Auftrags hervorgehoben an.
- Bei vorhandenem `errorDetail` steht darunter der aufklappbare Bereich „Technische Details“.

### Eckdaten
- Die Karte zeigt die Dachzeile „Auftrag“.
- Die Karte zeigt den Titel „Eckdaten.“.
- Die Zeile „Beauftragt“ zeigt das Feld `queuedAt`.
- Die Zeile „Abgeschlossen“ zeigt das Feld `endedAt`.
- Ohne Wert zeigt eine Zeile „–“.
- Die Zeile „Rechnerischer KI-Aufwand“ zeigt das Feld `costUsd` als US-Dollar-Betrag.
- Das Backend summiert in `costUsd` den Aufwand aller KI-Läufe des Auftrags.
