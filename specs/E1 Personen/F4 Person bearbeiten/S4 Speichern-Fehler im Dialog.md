# Speichern-Fehler im Dialog

## Meta
- **State:** Implemented

## User Story
Als Administration möchte ich bei einem Speichern-Fehler eine Fehlermeldung im Dialog sehen, damit ich die Ursache erkennen kann.

## Description
Scheitert die `PUT`-Anfrage (z. B. die Person wurde parallel gelöscht), bleibt der Dialog geöffnet und zeigt die Fehlermeldung des Backends an.

## Akzeptanzkriterien
- Bei einem fehlschlagenden Speichern bleibt der Dialog geöffnet.
- Der Dialog zeigt die Fehlermeldung des Backends an.
- Bei einer nicht mehr vorhandenen Person antwortet das Backend mit `404 Not Found`.
