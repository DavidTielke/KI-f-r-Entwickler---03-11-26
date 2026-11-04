# Fertigungsstraße

## Meta
- **State:** Implemented

## User Story
Als Fachbereich möchte ich auf einen Blick sehen, wie viele Vorgänge auf welcher Stufe von der Idee bis zur Auslieferung stehen, damit ich den Stand der Fertigung einschätzen kann.

## Description
Das Cockpit ist die Startseite der Software Factory. Oben zeigt es die Fertigungsstraße mit fünf Stationen. Jede Station nennt ihre Anzahl und führt in den passenden Bereich.

## Akzeptanzkriterien
### Kopfbereich
- Die Seite zeigt die Dachzeile „Übersicht“.
- Die Seite zeigt den Titel „Cockpit.“.
- Die Schaltfläche „Anforderungen ansehen“ führt zu `#/anforderungen`.
- Die Primäraktion „Idee erfassen“ führt zu `#/ideen?neu=1` (siehe F3 S2).
- Während des ersten Ladens steht auf der Seite „Wird geladen …“.
- Schlägt das Laden fehl, zeigt das UI die Fehlermeldung an.

### Fertigungsstraße
- Die Karte zeigt die Dachzeile „Fertigungsstraße“.
- Die Karte zeigt den Titel „Von der Idee zur Auslieferung.“.
- Die Stationen erscheinen in der Reihenfolge „Ideen in Klärung“, „Freigegeben“, „Offene Anforderungen“, „Umgesetzt“, „Auslieferungen“.
- Zwischen zwei Stationen steht ein Pfeil.
- Die Station „Ideen in Klärung“ zeigt die Anzahl der Ideen im Status `Draft`.
- Die Station „Ideen in Klärung“ zeigt den Untertitel „Im Dialog mit dem Product Owner“.
- Die Station „Ideen in Klärung“ führt zu `#/ideen`.
- Die Station „Freigegeben“ zeigt die Anzahl der Ideen im Status `Ready`.
- Die Station „Freigegeben“ zeigt den Untertitel „Bereit für Anforderungen“.
- Die Station „Freigegeben“ führt zu `#/ideen`.
- Die Station „Offene Anforderungen“ zeigt die Anzahl der Anforderungen, deren `state` nicht `Implemented` ist.
- Die Station „Offene Anforderungen“ zeigt den Untertitel „Warten auf die Umsetzung“.
- Die Station „Offene Anforderungen“ führt zu `#/anforderungen?filter=offen`.
- Die Station „Umgesetzt“ zeigt die Anzahl der Anforderungen im Status `Implemented`.
- Die Station „Umgesetzt“ zeigt den Untertitel „In {n} Funktion“ beziehungsweise „In {n} Funktionen“.
- Die Station „Umgesetzt“ führt zu `#/anforderungen?filter=umgesetzt`.
- Die Station „Auslieferungen“ zeigt die Anzahl der Aufträge vom Typ `delivery` mit dem Status `done` oder `partial`.
- Die Station „Auslieferungen“ zählt zurückgenommene Auslieferungen weiter mit.
- Die Station „Auslieferungen“ zeigt den Untertitel „Über die Software Factory“.
- Die Station „Auslieferungen“ führt zu `#/umsetzung`.
- Die Stationen „Ideen in Klärung“, „Freigegeben“ und „Offene Anforderungen“ sind hervorgehoben, sobald ihr Wert größer als 0 ist.
- Anforderungen aus Werkzeug-Themenbereichen zählen in keiner Station mit.
