# Auslieferung zurücknehmen

## Meta
- **State:** Implemented

## User Story
Als Fachbereich möchte ich eine Auslieferung zurücknehmen können, damit ich bei einem unerwünschten Ergebnis schnell zum vorherigen Stand zurückkehre.

## Description
Eine Rücknahme ist ein eigener Auftrag in der Warteschlange. Sie stellt den Stand vor der Auslieferung wieder her und liefert ihn erneut aus. Die betroffenen Anforderungen gelten danach wieder als offen. Eine Auslieferung mit einer Datenbankänderung lässt sich nicht automatisch zurücknehmen, weil die Datenbank sonst auf dem neuen Stand bliebe, während der Programmcode zurückspringt.

## Akzeptanzkriterien
### Aufruf
- Der Button „Auslieferung zurücknehmen“ ist nur bei einem Auftrag vom Typ `delivery` mit gesetztem `commit` sichtbar.
- Der Button ist nicht sichtbar, solange der Auftrag wartet oder läuft.
- Der Button ist nicht sichtbar, wenn `revertedBy` gesetzt ist.
- Der Button ist nicht sichtbar, wenn `changes` eine Datei unter `code/backend/Migrations/` enthält.
- Enthält `changes` eine solche Datei, zeigt die Seite „Diese Auslieferung enthält eine Datenbankänderung und lässt sich deshalb nicht automatisch zurücknehmen.“.
- Ein Klick öffnet einen Bestätigungsdialog mit dem Titel „Auslieferung zurücknehmen.“.
- Der Bestätigungsdialog zeigt „Der Stand vor dieser Auslieferung wird wiederhergestellt und erneut ausgeliefert. Die betroffenen Anforderungen gelten danach wieder als offen.“.
- Der Bestätigungsdialog enthält den Button „Abbrechen“.
- Der Bestätigungsdialog enthält den Button „Zurücknehmen“.
- Das Backend antwortet mit `202` und der Kennung des neuen Auftrags.
- Der neue Auftrag hat den Typ `revert`.
- Der neue Auftrag trägt den Titel „Rücknahme von {id}“.
- Der neue Auftrag übernimmt `stories` des zurückgenommenen Auftrags.
- `targetCommits` enthält alle Git-Versionen der Umsetzung einschließlich der Nachbesserungen.
- Bei der Beauftragung wird das Event `run` mit dem Titel „Rücknahme {id} der Auslieferung {Ziel} beauftragt“ ausgelöst.
- Das UI wechselt zu `#/umsetzung/{id}`.
- Das Backend antwortet bei einem anderen Auftragstyp oder ohne `commit` mit `409` und „Nur ausgelieferte Umsetzungen lassen sich zurücknehmen.“.
- Das Backend antwortet bei gesetztem `revertedBy` mit `409` und „Diese Auslieferung wurde bereits zurückgenommen.“.
- Das Backend antwortet bei einer bereits beauftragten Rücknahme derselben Auslieferung mit `409` und „Diese Auslieferung wird bereits zurückgenommen.“.
- Das Backend antwortet bei einer Datei unter `code/backend/Migrations/` in `changes` mit `409` und „Diese Auslieferung enthält eine Datenbankänderung und lässt sich deshalb nicht automatisch zurücknehmen.“.

### Ablauf
- Der Auftrag durchläuft die Phasen „Vorbereitung“, „Rücknahme“, „Auslieferung“ und „Betriebsprüfung“.
- Liegen in `code` außerhalb von `code/factory`, in `specs` oder in `docker-compose.yml` nicht gesicherte Änderungen, endet der Auftrag mit „Im Arbeitsstand liegen nicht gesicherte Änderungen.“.
- Das Backend erzeugt Gegen-Versionen zu allen in `targetCommits` genannten Git-Versionen, beginnend mit der jüngsten.
- Lässt sich die Gegen-Version nicht erzeugen, bricht das Backend den Vorgang ab und setzt den Stand zurück.
- Der Auftrag endet dann mit „Die Auslieferung lässt sich nicht automatisch zurücknehmen, weil spätere Änderungen darauf aufbauen.“.
- Das Backend trägt den Auftrag im Feld `revertedBy` der zurückgenommenen Umsetzung ein.
- Danach liefert das Backend aus und prüft den Betrieb wie bei einer Umsetzung (siehe S3).
- Eine Rücknahme führt keine Nachbesserung durch.

### Abschluss
- Der Auftrag erhält den Status `done`.
- Der Auftrag zeigt „Der Stand vor der Auslieferung {id} ist wiederhergestellt. Die betroffenen Anforderungen gelten wieder als offen.“.
- Beim Abschluss wird das Event `delivery` mit dem Titel „Auslieferung {id} zurückgenommen“ ausgelöst.
- Die zurückgenommene Umsetzung zeigt „Diese Auslieferung wurde durch {id} zurückgenommen.“ mit einem Verweis auf die Rücknahme.
- Die zurückgenommene Umsetzung trägt in der Tabelle die Marke „Zurückgenommen“.
