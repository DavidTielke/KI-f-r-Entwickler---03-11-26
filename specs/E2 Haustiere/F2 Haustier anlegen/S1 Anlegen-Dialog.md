# Anlegen-Dialog

## Meta
- **State:** Implemented

## User Story
Als Administration möchte ich über die Primäraktion „Anlegen" einen Dialog öffnen, in dem ich ein neues Haustier erfasse.

## Description
Die Primäraktion „Anlegen" auf der Haustiere-Seite öffnet einen modalen Dialog mit den Feldern `Name`, `Spezies` und `Person`. Der Bearbeiten-Dialog (siehe F3 S2) ist der gleiche Dialog mit vorausgefüllten Werten.

## Akzeptanzkriterien
- Die Primäraktion „Anlegen" öffnet einen modalen Dialog.
- Der Dialog zeigt den Titel „Haustier anlegen.".
- Der Dialog enthält das Feld `Name` als Textfeld mit dem Platzhalter „z. B. Rex".
- Das Feld `Name` akzeptiert max. 150 Zeichen.
- Der Dialog enthält das Feld `Spezies` als Auswahl mit den Optionen „Hund", „Katze", „Vogel" und „Dinosaurier".
- Das Feld `Spezies` zeigt bei Dialog-Öffnung die Option „Bitte wählen" an.
- Der Dialog enthält das Feld `Person` als Auswahl mit der Option „Keine Person" und allen persistierten Personen.
- Die `Person`-Optionen zeigen den `Name` der Person.
- Personen, die bereits ein Haustier haben, sind in der Auswahl ausgegraut und nicht wählbar.
- Beim Öffnen des Dialogs liegt der Fokus im Feld `Name`.
- Der Dialog enthält den Button „Abbrechen".
- Der Dialog enthält den Submit-Button „Anlegen".
- „Abbrechen" schließt den Dialog ohne Speicherung.
