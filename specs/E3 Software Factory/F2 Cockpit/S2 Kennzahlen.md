# Kennzahlen

## Meta
- **State:** Implemented

## User Story
Als Fachbereich möchte ich die wichtigsten Kennzahlen der Fertigung sehen, damit ich Fortschritt und Durchlaufzeit beurteilen kann.

## Description
Das Cockpit zeigt vier Kennzahlen-Kacheln. Sie beziehen sich auf die fachliche Anwendung. Werkzeug-Themenbereiche wie die Software Factory selbst zählen nicht mit.

## Akzeptanzkriterien
### Umsetzungsgrad
- Die Kachel „Umsetzungsgrad“ zeigt den gerundeten Anteil umgesetzter Anforderungen im Format `{n} %`.
- Ohne Anforderungen zeigt die Kachel „Umsetzungsgrad“ den Wert `0 %`.
- Die Kachel „Umsetzungsgrad“ zeigt einen Fortschrittsbalken mit diesem Anteil.
- Die Kachel „Umsetzungsgrad“ zeigt darunter „{k} von {n} Anforderung“ beziehungsweise „{k} von {n} Anforderungen“.

### Abnahmekriterien
- Die Kachel „Abnahmekriterien“ zeigt die Summe aller Abnahmekriterien.
- Die Kachel „Abnahmekriterien“ zeigt darunter „In {n} Themenbereich“ beziehungsweise „In {n} Themenbereichen“.

### Ideen gesamt
- Die Kachel „Ideen gesamt“ zeigt die Anzahl der Ideen in den Status `Draft`, `Ready` und `Übernommen`.
- Die Kachel „Ideen gesamt“ zeigt darunter „{n} in Anforderungen überführt“.

### Durchlaufzeit
- Die Kachel „Durchlaufzeit“ zeigt die durchschnittliche Dauer aller Aufträge vom Typ `delivery` mit dem Status `done` oder `partial`.
- Eine Durchlaufzeit unter einer Minute entspricht dem Format `{n} s`.
- Eine Durchlaufzeit unter einer Stunde entspricht dem Format `{n} min`.
- Eine Durchlaufzeit ab einer Stunde entspricht dem Format `{x,y} h`.
- Ohne gemessene Auslieferung zeigt die Kachel den Wert „–“.
- Ohne gemessene Auslieferung steht darunter „Noch keine Auslieferung gemessen“.
- Mit gemessener Auslieferung steht darunter „Je Auslieferung im Durchschnitt“.
