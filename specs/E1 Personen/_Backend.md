# Backend — Personen

- ASP.NET Core Web API (`PersonenApi`), Entity Framework Core + SQLite.
- Deployment: Container `personen-api` (Port 8080), Frontend `personen-web` (nginx, Port 3000).
- Keine Authentifizierung, keine Domain Events.

## Endpunkte (Basis `/api/persons`)

| Methode | Route | Anfrage | Erfolg | Fehler |
|---|---|---|---|---|
| GET | `/` | – | `200` Person-Liste (nach `Order`, dann `Name`) | – |
| GET | `/{id}` | – | `200` Person | `404` |
| POST | `/` | `{ Name, Age }` | `201` + `Location` | `400` Validierung |
| PUT | `/{id}` | `{ Name, Age }` | `204` | `400`, `404` |
| DELETE | `/{id}` | – | `204` | `404` |
| PATCH | `/reorder` | `{ Ids }` | `204` | `400` |

## Validierung

- `Name`: Pflichtfeld, max. 150 Zeichen; der übertragene Wert wird getrimmt.
- `Age`: Pflichtfeld, ganzzahlig, 0–150.
- `Ids` (Reorder): Pflichtfeld; leere oder doppelt befüllte Liste → `400` („Reihenfolge enthält doppelte oder fehlende Einträge."), nicht existierende `Id` → `400` („Reihenfolge enthält unbekannte Personen.").
- Bei Validierungsfehlern antwortet das Backend mit `400` und einem Problem-JSON (`title` bzw. `errors`); das Frontend nutzt diese Meldungen für die Anzeige (siehe F2 S4).
