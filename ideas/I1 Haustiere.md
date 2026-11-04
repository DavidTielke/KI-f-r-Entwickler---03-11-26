# Haustiere

## Meta
- **State:** Übernommen

## Problem
Die App verwaltet heute ausschließlich Personen. Es gibt keine Möglichkeit, Tiere zu erfassen oder Menschen mit Tieren zu verknüpfen. Wer wissen will, welches Haustier zu welcher Person gehört, kann das aktuell weder einpflegen noch ablesen.

## Lösungsidee
Neue Domäne „Haustier": Tiere werden eigenständig erfasst (Name + Spezies aus einer festen Vier-Liste: Hund, Katze, Vogel, Dinosaurier). Jedes Tier gehört zu höchstens einer Person, jede Person zu höchstens einem Tier (1:1). Die Zuordnung ist optional — Tier und Person können auch ohne Partner vorliegen. Wird eine Person gelöscht, bleibt ihr Tier erhalten; nur die Verknüpfung wird gelöst. Im Menü erscheint „Haustiere" als zweiter Eintrag unter Stammdaten (mit Zähler). Zugewiesen wird an beiden Stellen: im Tier-Editor (Person wählen) und auf der Person-Seite (Tier wählen); bereits besetzte Gegenstellen werden im UI ausgegraut.

## Scope
- **In Scope:** Haustier-Liste (nach Name sortiert), Haustier anlegen/bearbeiten/löschen, feste Spezies-Auswahl (Hund/Katze/Vogel/Dinosaurier), optionale 1:1-Verknüpfung Person↔Tier an beiden Seiten, „Haustiere"-Menüpunkt mit Zähler, Löschregel (Tier bleibt, Verknüpfung weg), 1:1-Prüfung per Ausgrauen.
- **Out of Scope:** manuelle Reihenfolge (Drag&Drop) für Tiere, erweiterbare Spezies-Liste ohne Codeänderung, n:m-Beziehung, weitere Tier-Attribute (Alter, Geburtsdatum, Gewicht), Domain Events, Authentifizierung.

## Auswirkungen auf den Bestand
- **Specs:** Neuer Epic `E2 Haustiere` (z. B. F1 Übersicht/App-Shell, F2 anlegen, F3 bearbeiten, F4 löschen) + Erweiterung der bestehenden `specs/E1 Personen` (F3/F4: Person bearbeitet Tier-Zuordnung). Betroffen: `specs/E1 Personen/_Menüstruktur.md` (neuer Eintrag „Haustiere" + Zähler), `specs/E1 Personen/_Datenstruktur.md` und `_Backend.md` (neue Entität + Endpunkte).
- **Datenstruktur:** Neue Tabelle `Pets` (Id, Name, Species[enum], PersonId[nullable, unique]). Auf `Person` optional `PetId` (1:1). Neue Migration für die Personen-DB.
- **Backend:** Neue Endpunkte unter `/api/pets` (GET `/`, GET `/{id}`, POST, PUT, DELETE), `Species`-Enum (Hund/Katze/Vogel/Dinosaurier), 1:1-Prüfung bei Zuordnung. DELETE einer Person löst nur die Verknüpfung, löscht das Tier nicht.
- **Quellcode:**
  - Backend: `Models/Pet.cs`, `Controllers/PetsController.cs`, `Dtos/PetRequest.cs` + `PetDto.cs`, Registrierung in `Data/PersonDbContext.cs`, Migration. Person-Controller/-DTO liefern `PetId`/zugeordnetes Tier; DELETE löst nur die Verknüpfung.
  - Frontend: `components/PetList.jsx`, `components/PetForm.jsx`, `api/pets.js`, `App.jsx` (Menüpunkt + Zähler), `PersonForm.jsx`/Person-Ansicht (Tier-Zuordnung).
  - Risiken: 1:1-Integrität (unique-FK) sauber abbilden; Zähler-Sync nach Lösch- und Zuordnungsaktionen; UI-Ausgrauung bei bereits besetzter Gegenstelle.

## Entscheidungen
- 2026-11-04: Tiere als eigenständige Einheit mit eigener Liste/CRUD (statt Feldern auf Person) — eigener Lebenszyklus.
- 2026-11-04: Tier-Attribute = Name + Spezies (Minimum, analog Person: Name + Alter).
- 2026-11-04: Verknüpfung strikt 1:1 (ein Tier ↔ eine Person).
- 2026-11-04: Spezies fest als Aufzählung (Hund, Katze, Vogel, Dinosaurier); Erweiterbarkeit ist Out-of-Scope.
- 2026-11-04: Bei Personen-Löschung bleibt das Tier erhalten, nur die Verknüpfung wird gelöst.
- 2026-11-04: Zuordnung an beiden Seiten (Tier-Editor + Person-Seite), Konflikte per Ausgrauen verhindert.
- 2026-11-04: Keine manuelle Reihenfolge für Tiere, Standard-Sortierung nach Name.
- 2026-11-04: „Haustiere" als neuer Stammdaten-Eintrag mit Zähler.

## Offene Punkte
- (leer)

## Übergang zu Specs
- 2026-11-04: Überführt in `specs/E2 Haustiere` (F1 Haustier-Übersicht, F2 Haustier anlegen, F3 Haustier bearbeiten, F4 Haustier löschen, F5 Modal-Verhalten; `_Datenstruktur.md`, `_Backend.md`).
- 2026-11-04: `specs/E1 Personen` erweitert: `F3 Person anlegen/S5`, `F4 Person bearbeiten/S5`, `F1 App-Shell/S2`, `F5 Person löschen/S3`, `_Menüstruktur.md`, `_Datenstruktur.md`, `_Backend.md`.
