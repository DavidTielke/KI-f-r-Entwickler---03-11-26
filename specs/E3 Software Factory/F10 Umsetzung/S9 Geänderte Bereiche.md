# Geänderte Bereiche

## Meta
- **State:** Implemented

## User Story
Als Fachbereich möchte ich sehen, welche Bereiche der Anwendung ein Auftrag geändert hat, damit ich dessen Reichweite einschätzen kann.

## Description
Nach der Sicherung einer Umsetzung fasst eine Karte die geänderten Dateien nach fachlichen Bereichen zusammen. Die einzelnen Dateien lassen sich aufklappen.

## Akzeptanzkriterien
- Die Karte ist nur sichtbar, wenn das Feld `changes` vorliegt.
- Das Backend ermittelt `changes` aus allen in `commits` genannten Git-Versionen des Auftrags.
- Das Backend ermittelt `changes` nur für Aufträge vom Typ `delivery`.
- Die Karte zeigt die Dachzeile „Auswirkung“.
- Die Karte zeigt den Titel „Geänderte Bereiche.“.
- Die Karte zeigt je Bereich die Anzahl der geänderten Dateien.
- Dateien unter `code/frontend` zählen zum Bereich „Oberfläche“.
- Dateien unter `code/backend/Migrations` zählen zum Bereich „Datenbank“.
- Übrige Dateien unter `code/backend` zählen zum Bereich „Serverlogik“.
- Dateien unter `specs/` zählen zum Bereich „Anforderungen“.
- Alle anderen Dateien zählen zum Bereich „Betriebsumgebung“.
- Der aufklappbare Bereich „Technische Details“ ist beim Öffnen zugeklappt.
- Aufgeklappt zeigt er je Datei den Pfad.
- Aufgeklappt zeigt er je Datei die hinzugefügten und entfernten Zeilen im Format `+{n} −{m}`.
