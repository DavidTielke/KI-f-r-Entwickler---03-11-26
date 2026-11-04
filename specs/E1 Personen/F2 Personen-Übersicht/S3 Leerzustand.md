# Leerzustand

## Meta
- **State:** Implemented

## User Story
Als Administration möchte ich bei leerem Bestand eine Anleitung statt einer leeren Tabelle sehen, damit ich weiß, wie ich die erste Person anlege.

## Description
Sind keine Personen persistiert, zeigt die Tabellenkarte statt der Tabelle einen Leerzustand mit Titel und Hinweistext.

## Akzeptanzkriterien
- Die Tabelle wird nicht angezeigt, wenn keine Personen persistiert sind.
- Der Leerzustand zeigt den Titel „Noch keine Personen.".
- Der Leerzustand zeigt den Hinweis „Legen Sie über die Aktion Anlegen die erste Person an.".
- Nach dem Anlegen der ersten Person zeigt die Karte die Tabelle statt des Leerzustands.
