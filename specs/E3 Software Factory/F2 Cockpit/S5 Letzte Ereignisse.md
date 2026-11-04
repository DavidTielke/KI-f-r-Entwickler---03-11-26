# Letzte Ereignisse

## Meta
- **State:** Implemented

## User Story
Als Fachbereich möchte ich im Cockpit die jüngsten Ereignisse sehen, damit ich ohne Seitenwechsel weiß, was zuletzt passiert ist.

## Description
Eine Karte zeigt die neuesten fachlichen Ereignisse und führt zum vollständigen Verlauf. Versionen aus der Versionsverwaltung erscheinen nur im Verlauf (siehe F11 S1).

## Akzeptanzkriterien
- Die Karte zeigt die Dachzeile „Verlauf“.
- Die Karte zeigt den Titel „Letzte Ereignisse.“.
- Die Schaltfläche „Verlauf öffnen“ führt zu `#/verlauf`.
- Das Backend liefert in `recent` die letzten 12 Einträge aus `events.jsonl`, neueste zuerst.
- Die Karte zeigt davon höchstens die ersten 6 Einträge.
- Ein Eintrag zeigt das Feld `title` des Ereignisses.
- Ein Eintrag zeigt das Feld `at` als Datum und Uhrzeit mit dem Zusatz „Uhr“.
- Ein Ereignis vom Typ `idea` trägt die Marke „Idee“.
- Ein Ereignis vom Typ `requirement` trägt die Marke „Anforderung“.
- Ein Ereignis vom Typ `run` trägt die Marke „Auftrag“.
- Ein Ereignis vom Typ `delivery` trägt die Marke „Auslieferung“.
- Ein Ereignis mit einem anderen Typ trägt die Marke „Ereignis“.
- Ohne Ereignisse steht dort „Sobald Sie mit der Software Factory arbeiten, erscheinen hier die Ereignisse.“.
