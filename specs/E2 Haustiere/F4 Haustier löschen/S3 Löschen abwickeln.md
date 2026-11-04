# Löschen abwickeln

## Meta
- **State:** Implemented

## User Story
Als Administration möchte ich ein bestätigtes Haustier dauerhaft löschen, damit der Bestand frei von ungültigen Einträgen bleibt.

## Description
Mit dem Button „Löschen" wird die `DELETE`-Anfrage gesendet, das Haustier im Backend entfernt und die Liste neu geladen. Eine verknüpfte Person wird nicht berührt.

## Akzeptanzkriterien
- Bei Bestätigung sendet das Frontend eine `DELETE /api/pets/{id}`-Anfrage.
- Das Backend entfernt das Haustier aus der Datenbank.
- Das Backend antwortet mit `204 No Content`.
- Nach erfolgreichem Löschen schließt sich der Bestätigungsdialog.
- Nach erfolgreichem Löschen wird die Haustierliste neu geladen.
- Das gelöschte Haustier ist nicht mehr in der Liste enthalten.
- Der Zähler am Navigationseintrag „Haustiere" zeigt die reduzierte Anzahl.
- Eine verknüpfte Person (falls vorhanden) bleibt erhalten; die Personenliste bleibt unverändert.
