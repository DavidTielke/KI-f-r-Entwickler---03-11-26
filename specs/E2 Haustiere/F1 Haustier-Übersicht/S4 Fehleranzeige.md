# Fehleranzeige

## Meta
- **State:** Implemented

## User Story
Als Administration möchte ich bei Fehlschlagen einer Aktion eine Fehlermeldung auf der Seite sehen, damit ich das Problem erkenne.

## Description
Scheitert eine API-Anfrage der Seite (Laden der Liste, Anlegen, Bearbeiten, Löschen), zeigt der Hauptbereich die Fehlermeldung des Backends über der Tabellenkarte an.

## Akzeptanzkriterien
- Bei einem fehlschlagenden API-Request zeigt die Seite die Fehlermeldung des Backends über der Tabellenkarte an.
- Das Backend liefert Validierungs- und Domfehler als Problem-JSON; die Seite zeigt den Text aus `title` bzw. die zusammengefassten `errors` an.
- Bei einem HTTP-Fehler ohne Problem-JSON zeigt die Seite „HTTP {Statuscode}" an.
- Die Fehlermeldung verschwindet, wenn die nächste erfolgreiche Anfrage abgeschlossen ist.
