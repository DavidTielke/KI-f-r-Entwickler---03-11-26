# Reorder-Validierung im Backend

## Meta
- **State:** Implemented

## User Story
Als Administration möchte ich, dass das Backend nur gültige Reihenfolge-Änderungen übernimmt, damit die Sortierung nicht beschädigt werden kann.

## Description
Der Reorder-Endpunkt nimmt eine vollständige ID-Liste entgegen, weist den Personen `Order`-Werte von 1 bis n in Listenreihenfolge zu und lehnt unvollständige oder ungültige Listen ab.

## Akzeptanzkriterien
- Der Reorder-Endpunkt akzeptiert eine Liste von `Id`-Werten.
- Die übergebene Listenreihenfolge wird als neue Anzeigereihenfolge übernommen.
- Die Personen erhalten `Order`-Werte von 1 bis n in Listenreihenfolge.
- Das Backend antwortet mit `204 No Content`.
- Bei einer leeren ID-Liste antwortet das Backend mit `400 Bad Request` und der Meldung „Reihenfolge enthält doppelte oder fehlende Einträge."
- Bei doppelten `Id`-Werten antwortet das Backend mit `400 Bad Request` und der Meldung „Reihenfolge enthält doppelte oder fehlende Einträge."
- Bei nicht existierenden `Id`-Werten antwortet das Backend mit `400 Bad Request` und der Meldung „Reihenfolge enthält unbekannte Personen."
