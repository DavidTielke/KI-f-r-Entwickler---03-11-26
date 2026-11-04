# Bearbeiten-Dialog

## Meta
- **State:** Implemented

## User Story
Als Administration möchte ich die Felder einer Person in einem vorausgefüllten Dialog ändern, damit ich die Daten der Person aktualisieren kann.

## Description
Der Bearbeiten-Dialog entspricht dem Anlegen-Dialog (siehe F3 S1), ist aber mit den aktuellen Werten der Person vorausgefüllt. Die Validierung entspricht der des Anlegen-Dialogs (siehe F3 S2).

## Akzeptanzkriterien
- Der Dialog zeigt den Titel „Person {id} bearbeiten.".
- Das Feld `Name` ist mit dem aktuellen `Name` der Person vorausgefüllt.
- Das Feld `Alter` ist mit dem aktuellen `Age`-Wert der Person vorausgefüllt.
- Der Dialog enthält den Submit-Button „Speichern".
- „Abbrechen" schließt den Dialog ohne Änderung.
