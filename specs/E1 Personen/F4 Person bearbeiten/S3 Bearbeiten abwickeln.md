# Bearbeiten abwickeln

## Meta
- **State:** Implemented

## User Story
Als Administration möchte ich geänderte Felder einer Person speichern, damit der Bestand aktuell bleibt.

## Description
Mit dem Submit-Button „Speichern" wird die `PUT`-Anfrage gesendet, die Person im Backend aktualisiert und die Liste neu geladen.

## Akzeptanzkriterien
- Bei gültiger Eingabe sendet der Dialog eine `PUT /api/persons/{id}`-Anfrage mit `Name` und `Age`.
- Das Backend aktualisiert `Name` und `Age` der Person.
- Das Backend antwortet mit `204 No Content`.
- Nach erfolgreichem Speichern schließt sich der Dialog.
- Nach erfolgreichem Speichern wird die Personenliste neu geladen.
- Die geänderten Werte sind in der Liste sichtbar.
- Während des Speicherns ist der Submit-Button deaktiviert und zeigt „Wird gespeichert …".
- Existiert die Person nicht mehr, antwortet das Backend mit `404 Not Found`.
