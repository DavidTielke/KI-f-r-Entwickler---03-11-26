# Anlegen abwickeln

## Meta
- **State:** Implemented

## User Story
Als Administration möchte ich ein gültiges Haustier anlegen, damit es im Bestand verfügbar ist.

## Description
Mit dem Submit-Button „Anlegen" wird das Formular an das Backend übermittelt, das Haustier angelegt und die Liste neu geladen.

## Akzeptanzkriterien
- Bei gültiger Eingabe sendet der Dialog eine `POST /api/pets`-Anfrage mit `Name`, `Species` und `PersonId`.
- Das Backend legt das Haustier mit dem übergebenen `Name`, `Species` und `PersonId` an.
- Das Backend antwortet mit `201 Created` und einem `Location`-Header auf `GET /api/pets/{id}`.
- Nach erfolgreichem Anlegen schließt sich der Dialog.
- Nach erfolgreichem Anlegen wird die Haustierliste neu geladen.
- Das neu angelegte Haustier erscheint in der Liste.
- Bei einer übergebenen `PersonId` zeigt die Spalte „Person" den `Name` der verknüpften Person.
- Der Zähler am Navigationseintrag „Haustiere" zeigt die erhöhte Anzahl.
- Während des Speicherns ist der Submit-Button deaktiviert.
- Während des Speicherns zeigt der Submit-Button „Wird gespeichert …".
