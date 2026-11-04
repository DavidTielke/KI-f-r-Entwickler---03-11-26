# Tafel nach Status

## Meta
- **State:** Implemented

## User Story
Als Fachbereich möchte ich alle Ideen nach ihrem Status auf einer Tafel sehen, damit ich erkenne, welche Idee in welcher Stufe steht und wo ich gefragt bin.

## Description
Die Seite „Ideen“ zeigt drei Spalten für die Status der Ideen. Jede Karte nennt Nummer, Titel, Problem und bei Ideen in Klärung den Reifegrad. Ein Klick öffnet den Ideen-Dialog.

## Akzeptanzkriterien
### Seite
- Die Seite ist unter `#/ideen` erreichbar.
- Die Seite zeigt die Dachzeile „Fertigung“.
- Die Seite zeigt den Titel „Ideen.“.
- Die Primäraktion „Idee erfassen“ ist sichtbar.
- Das Backend liest die Ideen aus den Dateien `ideas/I{n} {Titel}.md`.
- Dateien in `ideas/`, die diesem Format nicht entsprechen, erscheinen nicht auf der Tafel.
- Die Tafel aktualisiert sich bei Live-Meldungen zu den Themen `ideas` und `runs`.

### Spalten
- Die Tafel enthält die Spalten „In Klärung.“, „Freigegeben.“ und „Überführt.“.
- Die Spalte „In Klärung.“ enthält die Ideen im Status `Draft`.
- Die Spalte „Freigegeben.“ enthält die Ideen im Status `Ready`.
- Die Spalte „Überführt.“ enthält die Ideen im Status `Übernommen`.
- Die Spalte „In Klärung.“ zeigt den Hinweis „Der Product Owner schärft die Idee gemeinsam mit Ihnen.“.
- Die Spalte „Freigegeben.“ zeigt den Hinweis „Bereit, zu Anforderungen ausformuliert zu werden.“.
- Die Spalte „Überführt.“ zeigt den Hinweis „Daraus sind Anforderungen entstanden.“.
- Jede Spalte zeigt die Anzahl ihrer Karten.
- Innerhalb einer Spalte sind die Karten aufsteigend nach der Ideen-Nummer sortiert.
- Ohne Ideen erscheint statt der Tafel „Noch keine Ideen.“.
- Ohne Ideen steht darunter der Hinweis „Erfassen Sie Ihre erste Idee. Sie können sie einfach einsprechen.“.

### Karte
- Die Karte zeigt die Kennung `I{n}`.
- Die Karte zeigt den Titel der Idee.
- Die Karte zeigt das Feld `problem`.
- Eine Karte ohne Inhalt im Feld `problem` zeigt „Noch keine Beschreibung.“.
- Eine Karte im Status `Draft` zeigt einen Fortschrittsbalken mit dem Anteil erfüllter Reifegrad-Punkte.
- Eine Karte im Status `Draft` zeigt den Reifegrad im Format `{n}/7`.
- Karten in den Status `Ready` und `Übernommen` zeigen keinen Fortschrittsbalken.
- Arbeitet die KI an der Idee, zeigt die Karte die Aktivitätsmarke „Arbeitet“.
- Hat die letzte Runde mit einem Fehler geendet und arbeitet die KI nicht, zeigt die Karte die Marke „Störung“.
- Sind ohne Fehler 6 von 7 Reifegrad-Punkten einer Idee in Klärung erfüllt, zeigt die Karte die Marke „Bereit zur Freigabe“.
- Wartet die Idee auf den Anwender und sind weniger als 6 Punkte erfüllt, zeigt die Karte die Marke „Wartet auf Sie“.
- Ein Klick auf die Karte öffnet `#/ideen/{id}`.
