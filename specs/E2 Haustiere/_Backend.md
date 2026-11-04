# Backend — Haustiere

- ASP.NET Core Web API (`PersonenApi`), Entity Framework Core + SQLite; dieselbe App und dieselbe DB wie E1 Personen.
- Deployment: Container `personen-api` (Port 8080).

## Endpunkte (Basis `/api/pets`)

| Methode | Route | Anfrage | Erfolg | Fehler |
|---|---|---|---|---|
| GET | `/` | – | `200` Haustier-Liste (nach `Name`, dann `Id`) | – |
| GET | `/{id}` | – | `200` Haustier | `404` |
| POST | `/` | `{ Name, Species, PersonId }` | `201` + `Location` | `400` Validierung / 1:1 |
| PUT | `/{id}` | `{ Name, Species, PersonId }` | `204` | `400`, `404` |
| DELETE | `/{id}` | – | `204` | `404` |

- Die Haustier-Objekte enthalten `Id`, `Name`, `Species`, `PersonId` sowie `PersonName` (`null`, wenn keine Person verknüpft ist).

## Validierung

- `Name`: Pflichtfeld, max. 150 Zeichen; der übergebene Wert wird getrimmt.
- `Species`: Pflichtfeld; muss einer der vier Werte `Hund`, `Katze`, `Vogel`, `Dinosaurier` sein, sonst `400`.
- `PersonId`: optionales Feld; muss (falls angegeben) auf eine existierende `Person` zeigen, sonst `400` („Die Person existiert nicht.").
- 1:1-Regel: Eine `Person` darf höchstens ein Haustier haben.
  - Wird bei POST/PUT von `/api/pets` eine `PersonId` übergeben, die bereits ein anderes Haustier hat, antwortet das Backend mit `400` („Die Person hat bereits ein Haustier.").
  - `PersonId` wird im PUT auch mit leerem Wert gesendet; ein leerer Wert löst eine bestehende Verknüpfung.
- Bei Validierungsfehlern antwortet das Backend mit `400` und einem Problem-JSON (`title` bzw. `errors`); das Frontend nutzt diese Meldungen für die Anzeige.

## Querschnitt E1 Personen

- POST/PUT `/api/persons`: Das optionale Anfragefeld `PetId` ordnet der Person ein Haustier zu (1:1-Prüfung: unbekannte `PetId` → `400` „Das Haustier existiert nicht."; bereits verknüpft → `400` „Das Haustier ist bereits einer anderen Person zugeordnet."). Ein leerer `PetId`-Wert löst eine bestehende Verknüpfung.
- `DELETE /api/persons/{id}`: Ein zugeordnetes Haustier wird nicht gelöscht; nur die Verknüpfung wird gelöst (`Pets.PersonId` wird auf leer gesetzt).
