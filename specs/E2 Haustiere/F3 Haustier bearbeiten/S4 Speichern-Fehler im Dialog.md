# Speichern-Fehler im Dialog

## Meta
- **State:** Implemented

## User Story
Als Administration möchte ich bei einem Speichern-Fehler eine Fehlermeldung im Dialog sehen, damit ich die Ursache erkennen kann.

## Description
Scheitert die `PUT`-Anfrage (z. B. das Haustier wurde parallel gelöscht oder die 1:1-Prüfung greift), bleibt der Dialog geöffnet und zeigt die Fehlermeldung des Backends an.

## Akzeptanzkriterien
- Bei einem fehlschlagenden Speichern bleibt der Dialog geöffnet.
- Der Dialog zeigt die Fehlermeldung des Backends an.
- Bei einem 1:1-Konflikt (die Person hat bereits ein anderes Haustier) antwortet das Backend mit `400 Bad Request`.
- Bei einem nicht mehr vorhandenen Haustier antwortet das Backend mit `404 Not Found`.
