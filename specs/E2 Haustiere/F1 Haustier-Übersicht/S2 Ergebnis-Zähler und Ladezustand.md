# Ergebnis-Zähler und Ladezustand

## Meta
- **State:** Implemented

## User Story
Als Administration möchte ich die Anzahl der Haustiere und den Ladezustand im Tabellenkopf sehen, damit ich den Umfang des Bestands kenne.

## Description
Der Tabellenkopf zeigt während des Ladens einen Wartehinweis und nach dem Laden den Zähler mit der Tierzahl.

## Akzeptanzkriterien
- Der Tabellenkopf zeigt während des Ladens „Wird geladen …".
- Nach dem Laden zeigt der Tabellenkopf die Anzahl der geladenen Haustiere.
- Bei null Haustieren lautet der Zähler „0 Haustiere".
- Bei einem Haustier lautet der Zähler „1 Haustier".
- Bei mehreren Haustieren lautet der Zähler „{n} Haustiere".
