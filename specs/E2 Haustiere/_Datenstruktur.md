# Datenstruktur — Haustiere

## Pet (Tabelle `Pets`)

| Feld | Typ | Pflicht | Max. | Anmerkung |
|---|---|---|---|---|
| `Id` | int | ja | – | Primärschlüssel, auto-incrementiert |
| `Name` | text | ja | 150 | Anzeigename des Tiers |
| `Species` | text (Enum) | ja | – | Einer der vier Werte `Hund`, `Katze`, `Vogel`, `Dinosaurier` |
| `PersonId` | int (FK → `Persons`) | nein | – | 1:1-Verknüpfung, unique, nullable |

## Regeln

- Datenbank: SQLite über Entity Framework Core (gemeinsame DB `persons.db`, Container `personen-api`).
- `Species` ist eine feste Aufzählung aus genau vier Werten: `Hund`, `Katze`, `Vogel`, `Dinosaurier`. Eine erweiterbare Spezies-Liste ist Out-of-Scope.
- Die Verknüpfung Person ↔ Haustier ist strikt 1:1: ein Haustier gehört zu höchstens einer Person, eine Person zu höchstens einem Haustier.
- Die Verknüpfung wird ausschließlich über `Pets.PersonId` (unique) geführt; auf `Persons` existiert kein eigenes Verknüpfungsfeld.
- Die Zuordnung ist optional: ein Haustier darf ohne Person vorliegen, eine Person darf ohne Haustier vorliegen.
- Löschregel: Wird eine `Person` gelöscht, bleibt das zugeordnete Haustier in der Datenbank erhalten; nur die Verknüpfung wird gelöst (`Pets.PersonId` wird auf leer gesetzt).
