# Bearbeiten-Dialog

## Meta
- **State:** Implemented

## User Story
Als Administration möchte ich die Felder eines Haustiers in einem vorausgefüllten Dialog ändern, damit ich die Daten des Tiers aktualisieren kann.

## Description
Der Bearbeiten-Dialog entspricht dem Anlegen-Dialog (siehe F2 S1), ist aber mit den aktuellen Werten des Tiers vorausgefüllt. Die Validierung entspricht der des Anlegen-Dialogs (siehe F2 S2).

## Akzeptanzkriterien
- Der Dialog zeigt den Titel „Haustier {id} bearbeiten.".
- Das Feld `Name` ist mit dem aktuellen `Name` des Tiers vorausgefüllt.
- Das Feld `Spezies` ist mit dem aktuellen `Species`-Wert vorausgefüllt.
- Das Feld `Person` ist mit der aktuell verknüpften Person vorausgefüllt; bei fehlender Verknüpfung zeigt es „Keine Person".
- Die aktuell verknüpfte Person ist in der Auswahl wählbar.
- Personen, die bereits ein anderes Haustier haben, sind in der Auswahl ausgegraut und nicht wählbar.
- Der Dialog enthält den Submit-Button „Speichern".
- „Abbrechen" schließt den Dialog ohne Änderung.
