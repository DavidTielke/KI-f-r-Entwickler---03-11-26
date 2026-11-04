# Bearbeiten abwickeln

## Meta
- **State:** Implemented

## User Story
Als Administration möchte ich geänderte Felder eines Haustiers speichern, damit der Bestand aktuell bleibt.

## Description
Mit dem Submit-Button „Speichern" wird die `PUT`-Anfrage gesendet, das Haustier im Backend aktualisiert und die Liste neu geladen.

## Akzeptanzkriterien
- Bei gültiger Eingabe sendet der Dialog eine `PUT /api/pets/{id}`-Anfrage mit `Name`, `Species` und `PersonId`.
- Das Backend aktualisiert `Name`, `Species` und `PersonId` des Haustiers.
- Das Backend antwortet mit `204 No Content`.
- Nach erfolgreichem Speichern schließt sich der Dialog.
- Nach erfolgreichem Speichern wird die Haustierliste neu geladen.
- Die geänderten Werte sind in der Liste sichtbar.
- Während des Speicherns ist der Submit-Button deaktiviert und zeigt „Wird gespeichert …".
- Existiert das Haustier nicht mehr, antwortet das Backend mit `404 Not Found`.
