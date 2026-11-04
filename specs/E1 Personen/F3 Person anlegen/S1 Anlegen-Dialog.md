# Anlegen-Dialog

## Meta
- **State:** Implemented

## User Story
Als Administration möchte ich über die Primäraktion „Anlegen" einen Dialog öffnen, in dem ich eine neue Person erfasse.

## Description
Die Primäraktion „Anlegen" in der Kopfzeile öffnet einen modalen Dialog mit den Feldern `Name` und `Alter`. Der Bearbeiten-Dialog (siehe F4 S2) ist der gleiche Dialog mit vorausgefüllten Werten.

## Akzeptanzkriterien
- Die Primäraktion „Anlegen" öffnet einen modalen Dialog.
- Der Dialog zeigt den Titel „Person anlegen.".
- Der Dialog enthält das Feld `Name` als Textfeld mit dem Platzhalter „z. B. Alice".
- Das Feld `Name` akzeptiert max. 150 Zeichen.
- Der Dialog enthält das Feld `Alter` als Zahlenfeld mit dem Platzhalter „z. B. 30".
- Das Feld `Alter` ist mit den Grenzen 0 bis 150 angegeben.
- Beim Öffnen des Dialogs liegt der Fokus im Feld `Name`.
- Der Dialog enthält den Button „Abbrechen".
- Der Dialog enthält den Submit-Button „Anlegen".
- „Abbrechen" schließt den Dialog ohne Speicherung.
