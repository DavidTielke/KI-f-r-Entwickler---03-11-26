# Anforderungsliste

## Meta
- **State:** Implemented

## User Story
Als Fachbereich möchte ich alle Anforderungen in einer Liste sehen, damit ich ihren Inhalt und ihren Umsetzungsstand überblicke.

## Description
Die Seite „Anforderungen“ zeigt alle Anforderungen aus dem Ordner `specs/` in einer Tabelle. Von hier aus geht es zu den Details, zur Auswahl für die Umsetzung (siehe F10 S1) und zum Anlegen neuer Anforderungen (siehe F8 S1).

## Akzeptanzkriterien
### Seite
- Die Seite ist unter `#/anforderungen` erreichbar.
- Die Seite zeigt die Dachzeile „Fertigung“.
- Die Seite zeigt den Titel „Anforderungen.“.
- Die Primäraktion „Anforderung anlegen“ ist sichtbar.
- Das Backend liest die Anforderungen aus den Dateien `specs/E{n} {Themenbereich}/F{n} {Funktion}/S{n} {Titel}.md`.
- Die Kennung einer Anforderung entspricht dem Format `E{n}-F{n}-S{n}`.

### Tabelle
- Die Tabelle enthält die Spalten „Nummer“, „Anforderung“, „Funktion“, „Kriterien“ und „Status“.
- Die Zeilen folgen der numerischen Reihenfolge von Themenbereich, Funktion und Anforderung.
- Die Spalte „Nummer“ zeigt die Kennung im Format `E{n} · F{n} · S{n}`.
- Die Spalte „Anforderung“ zeigt den Titel als Verweis.
- Die Spalte „Anforderung“ zeigt darunter das Feld `userStory`.
- Die Spalte „Funktion“ zeigt den Namen der Funktion.
- Die Spalte „Kriterien“ zeigt die Anzahl der Abnahmekriterien.
- Die Spalte „Status“ zeigt für `Implemented` die Marke „Umgesetzt“.
- Die Spalte „Status“ zeigt für jeden anderen Status die Marke „Umsetzung offen“.
- Ein Klick auf eine Zeile öffnet `#/anforderungen/{id}`.
- Der Tabellenkopf nennt „{n} Anforderung“ beziehungsweise „{n} Anforderungen“.
- Während des Ladens nennt der Tabellenkopf „Wird geladen …“.
- Ohne Treffer erscheint „Keine Anforderungen gefunden.“.
- Ohne Treffer steht darunter „Ändern Sie den Filter oder legen Sie eine neue Anforderung an.“.
- Die Liste aktualisiert sich bei Live-Meldungen zu den Themen `requirements` und `runs`.
