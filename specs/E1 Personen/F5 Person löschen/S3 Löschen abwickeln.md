# Löschen abwickeln

## Meta
- **State:** Implemented

## User Story
Als Administration möchte ich eine bestätigte Person dauerhaft löschen, damit der Bestand frei von ungültigen Einträgen bleibt.

## Description
Mit dem Button „Löschen" wird die `DELETE`-Anfrage gesendet, die Person im Backend entfernt und die Liste neu geladen.

## Akzeptanzkriterien
- Bei Bestätigung sendet das Frontend eine `DELETE /api/persons/{id}`-Anfrage.
- Das Backend entfernt die Person aus der Datenbank.
- Das Backend antwortet mit `204 No Content`.
- Nach erfolgreichem Löschen schließt sich der Bestätigungsdialog.
- Nach erfolgreichem Löschen wird die Personenliste neu geladen.
- Die gelöschte Person ist nicht mehr in der Liste enthalten.
- Der Zähler am Navigationseintrag zeigt die reduzierte Anzahl.
