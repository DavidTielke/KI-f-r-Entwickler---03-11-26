# Ereignisliste und Filter

## Meta
- **State:** Implemented

## User Story
Als Fachbereich möchte ich alle Ereignisse und Versionen in einer Liste sehen und filtern, damit ich nachvollziehen kann, wann was passiert ist.

## Description
Der Verlauf führt die fachlichen Ereignisse der Factory und die Versionen aus der Versionsverwaltung in einer zeitlich sortierten Liste zusammen. Einträge führen zum betroffenen Vorgang.

## Akzeptanzkriterien
### Seite
- Die Seite ist unter `#/verlauf` erreichbar.
- Die Seite zeigt die Dachzeile „Transparenz“.
- Die Seite zeigt den Titel „Verlauf.“.
- Der Tabellenkopf nennt „{n} Eintrag“ beziehungsweise „{n} Einträge“.
- Während des Ladens nennt der Tabellenkopf „Wird geladen …“.
- Die Liste aktualisiert sich bei Live-Meldungen zu den Themen `ideas`, `requirements` und `runs`.

### Inhalt
- Das Backend liest alle Ereignisse aus `code/factory/data/events.jsonl`.
- Das Backend ergänzt die letzten 100 Git-Versionen des Repositories.
- Der neueste Eintrag steht oben.
- Die Tabelle enthält die Spalten „Zeitpunkt“, „Art“, „Ereignis“ und „Nachweis“.
- Die Spalte „Zeitpunkt“ zeigt Datum und Uhrzeit mit dem Zusatz „Uhr“.
- Ein Ereignis vom Typ `idea` trägt die Marke „Idee“.
- Ein Ereignis vom Typ `requirement` trägt die Marke „Anforderung“.
- Ein Ereignis vom Typ `run` trägt die Marke „Auftrag“.
- Ein Ereignis vom Typ `delivery` trägt die Marke „Auslieferung“.
- Eine Git-Version trägt die Marke „Version“.
- Die Spalte „Ereignis“ zeigt das Feld `title`.
- Bei einer Git-Version entspricht `title` dem Betreff der Version.
- Die Spalte „Nachweis“ zeigt `ref.commit`, sonst `ref.run`, sonst `ref.idea`, sonst `ref.story`, sonst „–“.

### Verweise
- Ein Eintrag mit `ref.run` führt zu `#/umsetzung/{id}`.
- Ein Eintrag mit `ref.idea` ohne `ref.run` führt zu `#/ideen/{id}`.
- Ein Eintrag mit `ref.story` führt zu `#/anforderungen/{id}`.
- Ein Eintrag ohne diese Angaben zeigt seinen Titel ohne Verweis.

### Filter
- Der Filter bietet „Alle“, „Ideen“, „Anforderungen“, „Aufträge“ und „Versionen“.
- Beim Öffnen der Seite ist „Alle“ aktiv.
- „Ideen“ zeigt nur Ereignisse vom Typ `idea`.
- „Anforderungen“ zeigt nur Ereignisse vom Typ `requirement`.
- „Aufträge“ zeigt nur Ereignisse vom Typ `run` und `delivery`.
- „Versionen“ zeigt nur Git-Versionen.
- Ohne Treffer erscheint „Keine Einträge.“.
- Ohne Treffer steht darunter „Für diesen Filter gibt es noch keine Ereignisse.“.
