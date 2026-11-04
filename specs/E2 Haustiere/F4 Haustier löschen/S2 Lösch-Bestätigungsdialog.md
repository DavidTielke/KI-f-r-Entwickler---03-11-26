# Lösch-Bestätigungsdialog

## Meta
- **State:** Implemented

## User Story
Als Administration möchte ich ein Haustier-Löschen bestätigen, damit versehentliches Löschen ausgeschlossen ist.

## Description
Der Bestätigungsdialog zeigt den Namen und die ID des zu löschenden Tiers, warnt vor dem dauerhaften Löschen und bietet die Auswahl „Abbrechen" bzw. „Löschen".

## Akzeptanzkriterien
- Der Bestätigungsdialog zeigt eine Danger-Kachel mit dem Mülleimer-Icon.
- Der Bestätigungsdialog zeigt den Titel „Haustier löschen.".
- Der Bestätigungsdialog zeigt den Text „«{name}» (#{id}) wird dauerhaft gelöscht. Diese Aktion kann nicht rückgängig gemacht werden."
- Der Bestätigungsdialog enthält den Button „Abbrechen".
- Der Bestätigungsdialog enthält den Danger-Button „Löschen".
- „Abbrechen" schließt den Bestätigungsdialog ohne Löschung.
- Das Löschen wird erst durch den Button „Löschen" ausgelöst.
