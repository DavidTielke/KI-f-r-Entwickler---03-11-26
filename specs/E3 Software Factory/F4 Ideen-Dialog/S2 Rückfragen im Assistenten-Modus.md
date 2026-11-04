# Rückfragen im Assistenten-Modus

## Meta
- **State:** Implemented

## User Story
Als Fachbereich möchte ich Rückfragen einzeln und mit konkreten Antwortoptionen beantworten, damit ich schnell entscheiden kann, ohne einen Fragebogen abzuarbeiten.

## Description
Stellt die KI Rückfragen, erscheinen sie im Gespräch nacheinander als Assistent mit auswählbaren Optionen und einer freien Ergänzung. Dieser Assistent gilt für den Ideen-Dialog und den Anforderungs-Assistenten gleichermaßen.

## Akzeptanzkriterien
### Regeln für die KI
- Eine Runde enthält höchstens 3 Rückfragen.
- Eine Rückfrage enthält 2 bis 4 Antwortoptionen.
- Die Nachricht der KI (`message`) enthält keine Frage.

### Darstellung
- Der Assistent zeigt immer nur eine Rückfrage.
- Der Assistent zeigt das Feld `header` als Dachzeile.
- Bei mehreren Rückfragen zeigt der Assistent den Fortschritt im Format `{n}/{m}`.
- Bei genau einer Rückfrage ist der Fortschritt nicht sichtbar.
- Jede Option zeigt ihre laufende Nummer.
- Jede Option zeigt das Feld `label`.
- Jede Option zeigt das Feld `description`.
- Eine Option mit `recommended` trägt die Marke „Empfehlung“.
- Eine gewählte Option zeigt statt der Nummer ein Häkchen.
- Der Assistent ist nicht sichtbar, solange die KI arbeitet.
- Der Assistent ist in einem schreibgeschützten Gespräch nicht sichtbar.

### Auswahl
- Bei einer Rückfrage ohne `multiSelect` ersetzt ein Klick die bisherige Auswahl.
- Bei einer Rückfrage mit `multiSelect` schaltet ein Klick die Option an oder aus.
- Das Feld mit dem Platzhalter „Eigene Antwort oder Ergänzung“ nimmt freien Text auf.
- Das Feld „Eigene Antwort oder Ergänzung“ lässt sich diktieren.

### Navigation
- Vor der letzten Rückfrage heißt der Button „Weiter“.
- Bei der letzten Rückfrage heißt der Button „Antworten senden“.
- Der Button ist deaktiviert, solange weder eine Option gewählt noch freier Text eingegeben ist.
- Ab der zweiten Rückfrage ist der Button „Zurückgehen“ sichtbar.
- „Zurückgehen“ zeigt die vorherige Rückfrage mit den bereits gewählten Antworten.
- Neue Rückfragen beginnen immer bei der ersten Frage.

### Senden
- Eine Antwort besteht aus den Beschriftungen der gewählten Optionen, durch Komma getrennt.
- Freier Text folgt den gewählten Optionen nach dem Trenner „ – “.
- Der Nachrichtentext entspricht je Rückfrage dem Format `Frage: {Frage}` und `Antwort: {Antwort}`.
- Das Feld `answers` der Nachricht enthält je Rückfrage die Felder `header`, `question` und `answer`.
- Gesendete Antworten erscheinen im Verlauf als Paare aus Frage und Antwort.

### Freie Antwort
- Bei offenen Rückfragen zeigt das Eingabefeld den Platzhalter „Oder antworten Sie frei in eigenen Worten“.
- Eine freie Antwort beendet die offenen Rückfragen, ohne sie einzeln zu beantworten.
