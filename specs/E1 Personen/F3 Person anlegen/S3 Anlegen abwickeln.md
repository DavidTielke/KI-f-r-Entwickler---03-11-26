# Anlegen abwickeln

## Meta
- **State:** Implemented

## User Story
Als Administration möchte ich eine gültige Person anlegen, damit sie im Bestand verfügbar ist.

## Description
Mit dem Submit-Button „Anlegen" wird das Formular an das Backend übermittelt, die Person angelegt und die Liste neu geladen.

## Akzeptanzkriterien
- Bei gültiger Eingabe sendet der Dialog eine `POST /api/persons`-Anfrage mit `Name` und `Age`.
- Das Backend legt die Person mit dem übergebenen `Name` und `Age` an.
- Die neu angelegte Person erhält den `Order`-Wert „aktuelle Anzahl der Personen + 1".
- Das Backend antwortet mit `201 Created` und einem `Location`-Header auf `GET /api/persons/{id}`.
- Nach erfolgreichem Anlegen schließt sich der Dialog.
- Nach erfolgreichem Anlegen wird die Personenliste neu geladen.
- Die neu angelegte Person erscheint in der Liste.
- Während des Speicherns ist der Submit-Button deaktiviert.
- Während des Speicherns zeigt der Submit-Button „Wird gespeichert …".
