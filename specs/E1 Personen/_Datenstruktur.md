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
- Die Verknüpfung zu Haustieren (Epic E2, Tabelle `Pets`) wird ausschließlich über `Pets.PersonId` (unique, nullable) geführt; auf `Persons` existiert kein eigenes Verknüpfungsfeld.
- Löschregel: Wird eine `Person` gelöscht, bleibt das zugeordnete Haustier erhalten; nur die Verknüpfung wird gelöst (`Pets.PersonId` wird auf leer gesetzt).
