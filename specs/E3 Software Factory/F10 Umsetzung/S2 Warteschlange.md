# Warteschlange

## Meta
- **State:** Implemented

## User Story
Als Fachbereich möchte ich alle Aufträge an einer Stelle sehen und weitere beauftragen können, während einer läuft, damit ich nicht auf dessen Ende warten muss.

## Description
Überführungen, Umsetzungen und Rücknahmen ändern den gemeinsamen Arbeitsstand und laufen deshalb strikt nacheinander. Die Seite „Umsetzung“ zeigt die aktiven Aufträge und alle bisherigen Aufträge.

## Akzeptanzkriterien
### Ablauf
- Über die Auftragstypen `transfer`, `delivery` und `revert` hinweg läuft immer höchstens ein Auftrag.
- Während ein Auftrag läuft, lassen sich weitere Aufträge beauftragen.
- Ein neuer Auftrag erhält eine Kennung im Format `L{n}`.
- Ein neuer Auftrag startet mit dem Status `queued`.
- Ist die Fertigung frei, startet der nächste Auftrag von selbst.
- Das Backend bearbeitet wartende Aufträge in der Reihenfolge der Beauftragung.
- Das Backend persistiert jeden Auftrag in `code/factory/data/runs/{id}.json`.

### Neustart des Dienstes
- Ein Neustart setzt wartende Aufträge auf den Status `failed`.
- Ein Neustart setzt laufende Aufträge auf den Status `failed`.
- Der Auftrag zeigt danach „Der Auftrag wurde durch einen Neustart des Dienstes unterbrochen.“.
- Eine beim Neustart aktive Phase ist danach als gescheitert markiert.

### Seite
- Die Seite ist unter `#/umsetzung` erreichbar.
- Die Seite zeigt die Dachzeile „Fertigung“.
- Die Seite zeigt den Titel „Umsetzung.“.
- Bei offenen Anforderungen zeigt die Primäraktion „{n} offene Anforderung auswählen“ beziehungsweise „{n} offene Anforderungen auswählen“.
- Ohne offene Anforderung zeigt die Primäraktion „Anforderungen ansehen“.
- Die Primäraktion führt zu `#/anforderungen?filter=offen`.

### Aktuell in der Fertigung
- Die Karte „Aktuell in der Fertigung.“ ist nur bei wartenden oder laufenden Aufträgen sichtbar.
- Die Karte zeigt als Dachzeile „{n} Auftrag“ beziehungsweise „{n} Aufträge“.
- Ein Eintrag zeigt die Kennung des Auftrags.
- Ein Eintrag zeigt die Art und den Titel im Format `{Art}: {Titel}`.
- Ein laufender Eintrag zeigt die Bezeichnung der aktiven Phase.
- Ein wartender Eintrag zeigt „Wartet auf Start“.
- Ein Eintrag führt zu `#/umsetzung/{id}`.

### Tabelle
- Die Tabelle enthält die Spalten „Nummer“, „Art“, „Auftrag“, „Beauftragt“, „Dauer“, „Version“ und „Status“.
- Der neueste Auftrag steht oben.
- Die Spalte „Art“ zeigt „Umsetzung“, „Überführung“ oder „Rücknahme“.
- Die Spalte „Dauer“ zeigt „–“, solange Start oder Ende fehlen.
- Die Spalte „Version“ zeigt die Kurzkennung der Git-Version oder „–“.
- Die Spalte „Status“ zeigt für `queued` die Marke „Wartet“.
- Die Spalte „Status“ zeigt für `running` die Marke „Läuft“.
- Die Spalte „Status“ zeigt für `done` die Marke „Abgeschlossen“.
- Die Spalte „Status“ zeigt für `partial` die Marke „Teilweise umgesetzt“.
- Die Spalte „Status“ zeigt für `failed` die Marke „Fehlgeschlagen“.
- Die Spalte „Status“ zeigt für `canceled` die Marke „Abgebrochen“.
- Die Spalte „Status“ zeigt bei gesetztem `revertedBy` die Marke „Zurückgenommen“.
- Ein Klick auf eine Zeile öffnet `#/umsetzung/{id}`.
- Der Tabellenkopf nennt „{n} Auftrag“ beziehungsweise „{n} Aufträge“.
- Ohne Aufträge erscheint „Noch keine Aufträge.“.
- Ohne Aufträge steht darunter „Wählen Sie unter Anforderungen die offenen Punkte aus und starten Sie die Umsetzung.“.
