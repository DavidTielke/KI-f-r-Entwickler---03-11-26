# Backend — Personen

- ASP.NET Core Web API (`Backend`), Entity Framework Core + SQLite.
- Deployment: Container `personen-api` (Port 8080), Frontend `personen-web` (nginx, Port 3000).
- Keine Authentifizierung, keine Domain Events.

## Endpunkte (Basis `/api/persons`)

| Methode | Route | Anfrage | Erfolg | Fehler |
|---|---|---|---|---|
| GET | `/` | – | `200` Person-Liste (nach `Order`, dann `Name`) | – |
| GET | `/{id}` | – | `200` Person | `404` |
| POST | `/` | `{ Name, Age, PetId? }` | `201` + `Location` | `400` Validierung / 1:1 |
| PUT | `/{id}` | `{ Name, Age, PetId? }` | `204` | `400`, `404` |
| DELETE | `/{id}` | – | `204` | `404` |
| PATCH | `/reorder` | `{ Ids }` | `204` | `400` |

## Validierung

- `Name`: Pflichtfeld, max. 150 Zeichen; der übertragene Wert wird getrimmt.
- `Age`: Pflichtfeld, ganzzahlig, 0–150.
- `Ids` (Reorder): Pflichtfeld; leere oder doppelt befüllte Liste → `400` („Reihenfolge enthält doppelte oder fehlende Einträge."), nicht existierende `Id` → `400` („Reihenfolge enthält unbekannte Personen.").
- `PetId` (POST/PUT): optionales Feld für die 1:1-Verknüpfung zu einem Haustier (Epic E2).
- Eine unbekannte `PetId` → `400` („Das Haustier existiert nicht.").
- Ist das übergebene Haustier bereits mit einer anderen Person verknüpft → `400` („Das Haustier ist bereits einer anderen Person zugeordnet.").
- Ein leerer `PetId`-Wert beim `PUT` löst eine bestehende Verknüpfung.
- `DELETE /{id}`: Ein zugeordnetes Haustier (falls vorhanden) wird nicht gelöscht; nur die Verknüpfung wird gelöst (`Pets.PersonId` wird auf leer gesetzt).
- Bei Validierungsfehlern antwortet das Backend mit `400` und einem Problem-JSON (`title` bzw. `errors`); das Frontend nutzt diese Meldungen für die Anzeige (siehe F2 S4).
