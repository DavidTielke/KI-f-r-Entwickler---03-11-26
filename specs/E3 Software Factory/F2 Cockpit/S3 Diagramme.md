# Diagramme

## Meta
- **State:** Implemented

## User Story
Als Fachbereich möchte ich den Stand der Anforderungen und die Aktivität der letzten Tage als Diagramme sehen, damit ich Schwerpunkte und Entwicklungen schnell erkenne.

## Description
Drei Diagramme zeigen die Anteile umgesetzter und offener Anforderungen, den Stand je Themenbereich sowie die Zahl der Änderungen je Tag. Werkzeug-Themenbereiche bleiben außen vor.

## Akzeptanzkriterien
### Stand der Anforderungen
- Die Karte zeigt die Dachzeile „Anteile“.
- Die Karte zeigt den Titel „Stand der Anforderungen.“.
- Das Ringdiagramm enthält die Segmente „Umgesetzt“ und „Umsetzung offen“.
- Ein Segment mit dem Wert 0 ist nicht sichtbar.
- In der Mitte des Rings steht die Gesamtzahl der Anforderungen mit dem Zusatz „gesamt“.
- Die Legende nennt für „Umgesetzt“ und „Umsetzung offen“ jeweils die Anzahl.

### Stand je Themenbereich
- Die Karte zeigt die Dachzeile „Vergleich“.
- Die Karte zeigt den Titel „Stand je Themenbereich.“.
- Das Diagramm zeigt je Themenbereich einen waagerechten, gestapelten Balken aus „Umgesetzt“ und „Umsetzung offen“.
- Die Legende nennt „Umgesetzt“ und „Umsetzung offen“ ohne Anzahl.
- Ohne Themenbereiche steht dort „Noch keine Themenbereiche vorhanden.“.

### Änderungen je Tag
- Die Karte zeigt die Dachzeile „Letzte 14 Tage“.
- Die Karte zeigt den Titel „Änderungen je Tag.“.
- Das Diagramm zeigt 14 aufeinanderfolgende Tage bis einschließlich heute.
- Das Backend zählt je Tag die Git-Versionen, die `code`, `specs` oder `ideas` berühren.
- Das Backend zählt nur Änderungen außerhalb von `code/factory` und `specs/E3 Software Factory`.
- Die Achse zeigt jeden zweiten Tag im Format `{TT}.`.
- Der Hinweis am Balken zeigt das Datum im Format `TT.MM.JJJJ`.
- Der Hinweis am Balken zeigt die Bezeichnung „Änderungen“ mit der Anzahl.
- Ohne Änderung im Zeitraum steht dort „Im Zeitraum gab es keine Änderungen.“.
