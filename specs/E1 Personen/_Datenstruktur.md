# Datenstruktur — Personen

## Person (Tabelle `Persons`)

| Feld | Typ | Pflicht | Max. | Anmerkung |
|---|---|---|---|---|
| `Id` | int | ja | – | Primärschlüssel, auto-incrementiert |
| `Name` | text | ja | 150 | Anzeigename der Person |
| `Age` | int | ja | – | Alter in Jahren |
| `Order` | int | ja | – | Manuelle Sortierreihenfolge, 1 = erste |

- Datenbank: SQLite über Entity Framework Core (Container `personen-api`, Volume `persons-data`).
- `Order` wird beim Anlegen auf „aktuelle Anzahl + 1" gesetzt und anschließend ausschließlich über den Reorder-Endpunkt geändert (siehe `_Backend.md`).
- Es existiert keine weitere Entität.
