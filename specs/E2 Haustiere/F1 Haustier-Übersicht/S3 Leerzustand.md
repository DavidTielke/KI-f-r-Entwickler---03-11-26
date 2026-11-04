# Leerzustand

## Meta
- **State:** Implemented

## User Story
Als Administration möchte ich bei leerem Bestand eine Anleitung statt einer leeren Tabelle sehen, damit ich weiß, wie ich das erste Haustier anlege.

## Description
Sind keine Haustiere persistiert, zeigt die Tabellenkarte statt der Tabelle einen Leerzustand mit Titel und Hinweistext.

## Akzeptanzkriterien
- Die Tabelle wird nicht angezeigt, wenn keine Haustiere persistiert sind.
- Der Leerzustand zeigt den Titel „Noch keine Haustiere.".
- Der Leerzustand zeigt den Hinweis „Legen Sie über die Aktion Anlegen das erste Haustier an.".
- Nach dem Anlegen des ersten Haustiers zeigt die Karte die Tabelle statt des Leerzustands.
