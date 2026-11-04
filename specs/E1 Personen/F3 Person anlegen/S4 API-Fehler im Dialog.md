# API-Fehler im Dialog

## Meta
- **State:** Implemented

## User Story
Als Administration möchte ich bei einem Anlegen-Fehler eine Fehlermeldung im Dialog sehen, damit ich die Eingabe korrigieren kann.

## Description
Scheitert die `POST`-Anfrage, bleibt der Dialog geöffnet und zeigt die Fehlermeldung des Backends unter den Feldern an.

## Akzeptanzkriterien
- Bei einem fehlschlagenden Anlegen bleibt der Dialog geöffnet.
- Der Dialog zeigt die Fehlermeldung des Backends unter den Formularfeldern an.
- Nach der Fehlermeldung ist das Formular erneut absendbar.
