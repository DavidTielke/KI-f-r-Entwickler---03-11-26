# Anfragen mit Mickey-Header ablehnen

## Meta
- **State:** Implemented

## User Story
Als Betreiber möchte ich Anfragen mit dem Header `Mickey: Mouse` ablehnen, damit solche Anfragen keine Funktion des Backends erreichen.

## Description
Das Backend (`code/backend`, Container `personen-api`) prüft jede eingehende Anfrage auf den Header `Mickey` mit dem Wert `Mouse`. Trifft das zu, lehnt es die Anfrage ab, bevor eine Route sie verarbeitet. Die Software Factory (`code/factory`) ist ein eigener Dienst und nicht betroffen.

## Akzeptanzkriterien

### Ablehnung
- Das Backend antwortet auf eine Anfrage mit dem Header `Mickey: Mouse` mit `403`.
- Der Antwort-Body entspricht dem Format `{ "message": "Requests with this header are not allowed." }`.
- Eine abgelehnte schreibende Anfrage verändert keine Daten in der Datenbank.

### Geltungsbereich
- Die Ablehnung gilt für jede Route unter `/api/persons`.
- Die Ablehnung gilt für jede Route unter `/api/pets`.
- Die Ablehnung gilt für `POST /api/testdata/reset`.
- Die Ablehnung gilt für `GET /openapi/v1.json`.
- Eine Anfrage an eine unbekannte Route mit dem Header `Mickey: Mouse` erhält `403` statt `404`.
- Eine `OPTIONS`-Anfrage mit dem Header `Mickey: Mouse` erhält `403`.
- Eine Anfrage mit ungültigem Body und dem Header `Mickey: Mouse` erhält `403` statt `400`.

### Abgrenzung
- Der Header-Name wird ohne Beachtung der Groß-/Kleinschreibung erkannt.
- Der Header-Wert muss exakt `Mouse` lauten.
- Eine Anfrage mit dem Header `Mickey` und einem anderen Wert als `Mouse` wird normal verarbeitet.
- Eine Anfrage ohne den Header `Mickey` wird normal verarbeitet.
