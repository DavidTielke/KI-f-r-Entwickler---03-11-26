# 04 Designregeln

## Meta
- **Stand:** 2026-11-04
- **Bezug:** code/backend, code/frontend/src, code/factory, harness/_design.md, harness/_code.md, harness/_uiux.md

Dieses Dokument beschreibt, nach welchen Regeln der Code **tatsächlich** geschrieben ist (Ist-Stand). Es
wiederholt die Harness-Vorgaben nicht, sondern verlinkt sie und ergänzt, was dort nicht geregelt ist.

| Thema | Maßgebliche Quelle |
|---|---|
| Backend-Architektur, Entitäten, DTOs, EF-Konfiguration, Controller, Statuscodes, Migrationen | [`_design.md`](../../harness/_design.md), maschinell geprüft über `harness/_design.ndrules` |
| C#-Codestil (Namen, `l_`-Präfix, Formatierung, ReSharper) | [`_code.md`](../../harness/_code.md), maschinell geprüft über `harness/PersonManager.sln.DotSettings` |
| Visuelles Design, Copy, Komponenten, `dt-*`-Klassen | [`_uiux.md`](../../harness/_uiux.md) |
| Validierung ist im Backend autoritativ | [`_requirements.md`](../../harness/_requirements.md) |
| Regeln für UI-Tests (Locators, Page Objects) | [`_uitests.md`](../../harness/_uitests.md) |

Stand der automatischen Prüfung am 2026-11-04 (`python harness/analyse_all.py`): ReSharper (`code`) ohne
Befunde, NDepend (`swd`) mit 38 Regeln erfüllt. Die in „Bewusste Abweichungen" genannten Punkte sind
Abweichungen von den **nicht statisch prüfbaren** Teilen von `_design.md` (dort Abschnitt 7) und werden
deshalb von den Werkzeugen nicht gemeldet.

---

## 1. Schichten und Abhängigkeitsrichtung

Das Backend ist zweischichtig: Controller greifen direkt auf `AppDbContext` zu. Die erlaubten
Abhängigkeiten stehen in [`_design.md`, Abschnitt 1](../../harness/_design.md) und werden von NDepend
erzwungen (`ARCH01`–`ARCH09`). Der Ist-Stand der Ordner steht in [Bausteine](02%20Bausteine.md).

### Keine zusätzliche Schicht zwischen Controller und Datenbank

**Regel:** Fachlogik steht im Controller. Es gibt keine Service-, Repository- oder Mapper-Klassen.
**Warum:** Das System hat zwei Entitäten und einen Einzelplatzbetrieb; jede weitere Schicht wäre
Indirektion ohne Nutzen. NDepend bricht den Build-Check bei einem Typ mit Namen wie `*Service` ab.

- ✅ `PetsController` fragt `db.Pets` direkt ab und kapselt die wiederkehrende Projektion in einer
  **privaten** Methode des Controllers:
  ```csharp
  private IQueryable<PetResponse> ToResponses(IQueryable<Pet> pets)
  {
      return pets.Select(p => new PetResponse(p.Id, p.Name, p.Species, p.PersonId, /* PersonName */ ...));
  }
  ```
- ❌ `class PetService { ... }` oder `interface IPetRepository`

### Frontend: Komponenten kennen die API nicht

**Regel:** Nur `src/App.jsx` importiert `src/api/*.js`. Formulare und Listen erhalten Daten und Callbacks
als Props (`onSubmit`, `onEdit`, `onDelete`, `onClose`).
**Warum:** Eine einzige Stelle lädt und mutiert Daten; Komponenten bleiben ohne Netzwerk lesbar.

- ✅ `PersonList` bekommt `persons`, `onEdit`, `onDelete`, `onReorder` und ruft nie `fetch`.
- ❌ `PersonForm` ruft `personsApi.createPerson(...)` selbst auf.

---

## 2. Domain vs. DTO

Regeln zu Entitäten, `*Request`/`*Response` und Controller-Rückgaben: [`_design.md`, Abschnitte 2, 3
und 5](../../harness/_design.md). Ergänzend gilt im Ist-Stand:

### Request-Eingaben werden vor dem Speichern getrimmt

**Regel:** Textfelder aus dem Request werden im Controller mit `Trim()` übernommen.
**Warum:** Das Frontend trimmt ebenfalls, aber das Backend ist autoritativ; ein direkter API-Aufruf darf
keine Namen mit führenden oder angehängten Leerzeichen anlegen.

- ✅ `Name = request.Name.Trim()` (in `PersonsController` und `PetsController`)
- ❌ `Name = request.Name`

### Geschlossene Wertemenge als `string` mit `[RegularExpression]`

**Regel:** Die Spezies eines Haustiers ist ein `string` auf Entität und DTO, kein Enum; das Request-DTO
prüft sie per Regex.
**Warum:** `Backend.Dtos` darf `Backend.Models` nicht kennen (`ARCH06`), ein Enum der Entität wäre im DTO
nicht verwendbar.

- ✅ `[RegularExpression("^(Hund|Katze|Vogel|Dinosaurier)$", ErrorMessage = "Spezies ist ungültig.")]`
- ❌ `public Species Species { get; set; }` mit einem Enum aus `Backend.Models`

---

## 3. Fehlerbehandlung

### Das Backend wirft keine erwarteten Exceptions

**Regel:** Erwartbare Fehlerfälle (unbekannte Id, ungültige Referenz, Regelverstoß) werden im Controller
geprüft und als `NotFound()` bzw. `BadRequest(...)` zurückgegeben. Es gibt weder `try/catch` noch eigene
Middleware oder Exception-Handler (`ARCH09`).
**Warum:** Der Kontrollfluss bleibt in der Aktion lesbar; unerwartete Fehler sind echte Defekte und sollen
als `500` sichtbar werden.

- ✅ `if (l_pet is null) { return NotFound(); }`
- ❌ `try { ... } catch (Exception) { return StatusCode(500); }`

### Fachliche Prüfungen vor dem Schreiben, Meldung als deutscher Satz

**Regel:** Referenz- und Regelprüfungen (existiert die Person, hat sie schon ein Haustier) laufen vor
`SaveChangesAsync`; die Meldung ist ein vollständiger deutscher Satz mit Punkt, weil sie unverändert im
Dialog erscheint. (Zur Abweichung vom Fehlerformat aus `_design.md` siehe „Bewusste Abweichungen", Punkt 1.)
**Warum:** Das Frontend zeigt `err.message` ungefiltert an (`setApiError(err.message)`); die Sprache der
Meldung ist damit Teil der Oberfläche ([`_uiux.md`, Abschnitt 2](../../harness/_uiux.md)).

- ✅ `return BadRequest("Die Person hat bereits ein Haustier.");`
- ❌ `return BadRequest("PersonId conflict");`

### Frontend: Fehler als `Error` werfen, am Aufrufer anzeigen

**Regel:** Der API-Client wirft bei `!res.ok` einen `Error` mit lesbarer Meldung. Formulare fangen ihn
in `handleSubmit` und zeigen ihn im Dialog; die Seite fängt ihn in `loadAll` und zeigt ihn über der Liste.
**Warum:** Ein Fehler soll dort erscheinen, wo der Nutzer die auslösende Aktion ausgeführt hat.

- ✅ `catch (err) { setApiError(err.message) } finally { setSaving(false) }` in `PersonForm`
- ❌ `alert(err.message)` oder ein stummes `catch {}` um den Aufruf

---

## 4. Validierung

**Regel:** Die Request-DTOs validieren mit DataAnnotations (`[Required]`, `[StringLength]`, `[Range]`,
`[RegularExpression]`), `[ApiController]` liefert daraus automatisch `400`. Das Frontend validiert
zusätzlich vorab, damit der Nutzer sofort Rückmeldung erhält, **übernimmt aber nicht** die Entscheidung.
**Warum:** Backend ist autoritativ ([`_requirements.md`](../../harness/_requirements.md)); die
Client-Prüfung ist reine Bequemlichkeit und darf strenger oder gleich sein, nie die einzige Prüfung.

- ✅ Dieselbe Grenze an drei Stellen: `[StringLength(150)]` im DTO, `.HasMaxLength(150)` in
  `PersonConfiguration`, `maxLength={150}` im Eingabefeld von `PersonForm`.
- ❌ Grenze nur im Frontend (`maxLength={150}`), im Backend ohne Attribut.

**Regel:** Die Texte der Client-Validierung sind wortgleich mit den `ErrorMessage` der DTOs
(`Name ist erforderlich.`, `Alter muss zwischen 0 und 150 liegen.`).
**Warum:** Der Nutzer sieht dieselbe Meldung, egal welche Ebene zuerst greift.

- ✅ `setAgeError('Alter muss zwischen 0 und 150 liegen.')` und `[Range(0, 150, ErrorMessage = "Alter muss zwischen 0 und 150 liegen.")]`
- ❌ Zwei verschiedene Formulierungen für dieselbe Regel.

---

## 5. Namenskonventionen

C#-Namen (`l_`-Präfix für lokale Variablen, kein `Async`-Suffix, Namespaces gleich Ordner): siehe
[`_code.md`, Abschnitte 1 und 2](../../harness/_code.md). Zusätzlich gilt im Ist-Stand:

| Gegenstand | Konvention | Beispiel |
|---|---|---|
| Controller / Route | `{Xs}Controller`, Route als Kleinbuchstaben-Plural | `PersonsController`, `api/persons`, `api/pets` |
| Aktionen | `Get{Xs}`, `Get{X}`, `Create{X}`, `Update{X}`, `Delete{X}`, `Update{Xs}Position` | `GetPets`, `UpdatePersonsPosition` |
| JSON-Felder | camelCase (Framework-Standard) | `personName`, `petId` |
| React-Komponenten | `PascalCase.jsx`, Default-Export, eine Komponente je Datei | `PersonForm.jsx` |
| API-Module | kleingeschrieben, Plural der Ressource, benannte Funktionen `list`/`create`/`update`/`delete` + Entität | `api/pets.js` mit `listPets`, `createPet` |
| Event-Props | `on` + Verb | `onEdit`, `onSubmit`, `onReorder` |
| Handler in Komponenten | `handle` + Verb | `handleCreate`, `handlePetDelete` |
| Zustand | `[wert, setWert]`; Dialogzustand als `{x}Open` / `{x}DeleteTarget` | `formOpen`, `deleteTarget` |
| CSS-Klassen | BEM-artig mit Präfix `dt-` (nur aus `dt-app.css`) | `dt-modal__title`, `dt-btn--primary` |
| Eingabe-Ids | `{entität}-{feld}`, passend zum `htmlFor` des Labels | `person-name`, `person-pet` |
| Datei im Factory-Server | kleingeschrieben, Singular/Substantiv, ES-Module | `server/sessions.js` |

### Elemente werden über zugängliche Namen auffindbar gemacht, `data-testid` nur bei Bedarf

**Regel:** Interaktive Elemente erhalten ein sichtbares Label oder ein `aria-label`; ein `data-testid`
wird nur ergänzt, wenn es keinen stabilen zugänglichen Namen gibt (Format kebab-case, fachlich, z. B.
`person-row-delete`; Details in [`_uitests.md`, Abschnitt 10](../../harness/_uitests.md)). Im aktuellen
Code existiert **kein** `data-testid`: alle Aktionen sind über Rolle und Name erreichbar.
**Warum:** Zugängliche Namen dienen Screenreadern und Tests zugleich; ein Test-Attribut ist nur der
Notnagel.

- ✅ `aria-label={`Haustier ${p.id} löschen`}` an einem Icon-Button (`PetList.jsx`), im Test
  `getByRole('button', { name: ... })`
- ❌ `<button className="dt-iconbtn" data-testid="btn-1">` ohne Namen

### Icons sind SVG-Komponenten, dekorativ ausgeblendet

**Regel:** Icons kommen aus `components/icons.jsx` als Funktionen, die ein SVG mit `aria-hidden: true`
liefern; die Bedeutung trägt `aria-label`/`title` des umgebenden Buttons.
**Warum:** Keine Unicode-Glyphen als Icons ([`_uiux.md`, Abschnitt 2](../../harness/_uiux.md)); der
zugängliche Name darf nicht vom Icon abhängen.

- ✅ `<button aria-label="Schließen" ...>{IconClose()}</button>`
- ❌ `<button>✕</button>`

---

## 6. Frontend-Zustand

Das Frontend (`code/frontend`) besteht aus `App.jsx` plus Komponenten für Formulare und Listen.

### Zustand liegt in `App`, Komponenten halten nur lokalen Formularzustand

**Regel:** Daten (`persons`, `pets`), Ladezustand, Fehler und „welcher Dialog ist offen" leben als
`useState` in `App`. Eine Komponente hält ausschließlich Zustand, der nur sie betrifft:
Formularwerte, Feldfehler, `saving`, Drag-Zustand der Liste.
**Warum:** Eine Quelle der Wahrheit pro Datum; nach jeder Mutation wird neu geladen (`loadAll`), so
stimmen Liste, Zähler in der Navigation und Dropdowns immer überein.

- ✅ `const [persons, setPersons] = useState([])` in `App`; `const [name, setName] = useState(...)` in `PersonForm`
- ❌ `PersonList` lädt seine Daten selbst und `App` kennt sie nicht (Nav-Zähler wäre veraltet).

### Dialoge werden bedingt gerendert und über `key` zurückgesetzt

**Regel:** Ein Dialog existiert nur, solange sein Zustand nicht `null` ist (`formOpen !== null && <PersonForm .../>`).
Der `key` hängt am bearbeiteten Datensatz (`'new'` oder die Id), damit der lokale Formularzustand beim
Wechsel neu initialisiert wird. Die Werte werden aus `initial` abgeleitet, nicht per Effekt synchronisiert.
**Warum:** Ein offener Dialog behält sonst Eingaben des vorigen Datensatzes.

- ✅ `<PersonForm key={formOpen === 'create' ? 'new' : formOpen.id} initial={...} />`
- ❌ Dialog immer gerendert, Felder per `useEffect` auf `initial` nachgezogen.

### Nach Mutation neu laden, optimistisch nur beim Umsortieren

**Regel:** `handleCreate`, `handleUpdate` und `handleDelete` rufen die API, schließen den Dialog und laden
mit `loadAll()` neu. Nur `handleReorder` aktualisiert die Liste sofort und lädt bei Fehler neu.
**Warum:** Das Backend vergibt Ids und Reihenfolge; nur beim Verschieben wäre die Wartezeit sichtbar
störend, und das Ergebnis ist vorhersagbar.

- ✅ `await personsApi.deletePerson(id); setDeleteTarget(null); await loadAll()`
- ❌ Datensatz lokal aus dem Array entfernen, ohne Server-Antwort abzuwarten (außer Reorder).

### Lade- und Leerzustand sind getrennte Zweige

**Regel:** Die Ansicht unterscheidet `loading` (kein Inhalt, Kopfzeile „Wird geladen …"), leere Liste
(`dt-empty` mit Hinweis) und gefüllte Liste.
**Warum:** Eine leere Liste darf nie als „noch nicht geladen" erscheinen und umgekehrt.

- ✅ `{loading ? null : persons.length === 0 ? <div className="dt-empty">...</div> : <PersonList .../>}`
- ❌ Beim Laden direkt „Noch keine Personen." zeigen.

### Factory-Frontend: Router und Live-Daten statt zentralem Zustand

**Regel:** `code/factory/src` hält keinen globalen Store. Die Ansicht ergibt sich aus dem URL-Hash
(`useRoute` in `lib/router.js`, Navigation per `navigate('#/…')`); Daten kommen über `useLive(url, topics)`
aus `lib/api.js`, das bei Server-Sent Events zu den Themen neu lädt.
**Warum:** Die Factory zeigt Zustand, den ein Hintergrundprozess ändert (Läufe, Dialoge); die Ansichten
müssen sich ohne eigenes Neuladen aktualisieren.

- ✅ `const route = useRoute()` in `App.jsx`, Seiten unter `pages/` laden per `useLive`.
- ❌ Jede Seite öffnet ihre eigene `EventSource`-Verbindung (`ensureSource()` hält eine gemeinsame).

---

## 7. API-Zugriff im Frontend

### Ein Modul pro Ressource, alle Aufrufe über ein `request`-Wrapper

**Regel:** Jede Ressource hat ein Modul unter `src/api/` mit einer lokalen `request(url, options)`-Funktion
und einer benannten Exportfunktion je Endpunkt. Relative URLs (`/api/persons`), niemals ein Host.
**Warum:** Dev-Server (Vite-Proxy `/api` → `http://localhost:5215`) und Container (nginx-Proxy `/api/`)
leiten gleichartig weiter; so braucht das Frontend kein CORS und keine Konfiguration der Backend-Adresse.

- ✅ `export function updatePet(id, data) { return request(`${BASE}/${id}`, { method: 'PUT', body: JSON.stringify(data) }) }`
- ❌ `fetch('http://localhost:5215/api/pets')` in einer Komponente

### Antworten werden einheitlich ausgewertet

**Regel:** `request` setzt `Content-Type: application/json`, liefert bei `204` `null`, sonst das geparste
JSON, und baut bei Fehlern die Meldung aus `title`, `errors` oder `detail` des Bodys (Rückfall
`HTTP {status}`). Eine nicht-JSON-Antwort bricht die Fehlerbehandlung nicht ab (`try/catch` um das Parsen).
**Warum:** Aufrufer müssen sich nicht um Statuscodes kümmern, sie erhalten Daten oder eine `Error`-Meldung.

- ✅ `if (res.status === 204) return null`
- ❌ Aufrufer prüft `res.status` selbst.

### Parallel laden, was unabhängig ist

**Regel:** Unabhängige Ladevorgänge laufen mit `Promise.all`.
**Warum:** Die Seite braucht Personen **und** Haustiere gleichzeitig (Zähler, Dropdowns); sequentielles
Laden verdoppelt die Wartezeit.

- ✅ `const [personsData, petsData] = await Promise.all([personsApi.listPersons(), petsApi.listPets()])`
- ❌ Zwei aufeinanderfolgende `await` ohne Abhängigkeit.

### Factory: Fehlerformat `{ error }` und `HttpError`

**Regel:** Der Factory-Server (`code/factory/server`, Express, ES-Module) wirft `HttpError` über die
Helfer `badRequest`, `notFound`, `conflict` aus `errors.js`; der Client (`lib/api.js`) liest `data.error`.
Das ist ein anderes Format als das des Personen-Backends.
**Warum:** Die Factory ist ein eigenständiges Werkzeug mit eigenem Vertrag; die Backend-Regeln aus
`_design.md` gelten für sie nicht (siehe `harness/_design.md`, Geltungsbereich `/code/backend`).

- ✅ `throw notFound('…')` im Server, `throw new Error(data?.error ?? '…')` im Client
- ❌ `ProblemDetails`-Parsing im Factory-Client

---

## 8. Typisierung

**Regel:** Beide Frontends sind JavaScript (`.js`/`.jsx`, ES-Module), ohne TypeScript, ohne `tsconfig.json`
und ohne PropTypes. Die Form der Daten ist durch die Backend-DTOs ([API](03%20API.md)) bestimmt; Komponenten
lesen Felder in der Schreibweise, die über die Leitung geht (`personName`, `petId`).
**Warum:** Der Projektumfang ist klein; die Typsicherheit liegt im Backend (C#, Nullable) und in den
UI-Tests. Eine zweite Typdefinition im Frontend müsste mit den DTOs synchron gehalten werden.

- ✅ `{p.personName ?? '—'}` – optionale Felder werden an der Verwendungsstelle abgefangen.
- ❌ Ein Feld umbenennen (`PersonName`), das nicht dem JSON des Backends entspricht.

**Regel:** Lint ist `oxlint` (`.oxlintrc.json`) mit `react/rules-of-hooks` als Fehler und
`react/only-export-components` als Warnung. Das Factory-Frontend hat keine Lint-Konfiguration.
**Warum:** Hook-Fehler sind die häufigste stille Fehlerquelle in React.

- ✅ Hooks nur auf oberster Ebene einer Komponente (`useState` am Funktionsanfang).
- ❌ `useState` innerhalb von `if` oder Schleife.

---

## 9. Styling-Nutzung im Frontend

Farben, Typografie, Komponenten und Copy sind **ausschließlich** in
[`_uiux.md`](../../harness/_uiux.md) geregelt. Hier steht nur, wie der Code das Stylesheet einbindet.

### Eine globale Stylesheet-Datei, nur `dt-*`-Klassen

**Regel:** `src/dt-app.css` wird einmal in `main.jsx` importiert. Komponenten setzen ausschließlich
`dt-*`-Klassen; Zustände sind Modifikatorklassen (`is-active`, `is-error`), die per Template-String
zusammengesetzt werden.
**Warum:** Tokens und Komponenten sind zentral definiert; keine eigenen Farben oder Abstände in
Komponenten.

- ✅ `className={`dt-input${nameError !== '' ? ' is-error' : ''}`}`
- ❌ `style={{ color: '#f38a2c' }}` oder ein eigenes CSS-Modul je Komponente

### Das Stylesheet liegt als Kopie vor

**Regel:** `code/frontend/src/dt-app.css` und `code/factory/src/dt-app.css` sind Kopien von
`harness/dt-app.css`; die Factory ergänzt eigene Klassen in `factory.css`.
**Warum:** Beide Projekte werden getrennt gebaut (eigenes `package.json`, eigener Container); sie können
nicht aus `harness/` importieren.

- ✅ Neue Factory-Komponente: Klassen aus `dt-app.css` verwenden, Fehlendes in `factory.css`.
- ❌ Eine Komponentenklasse in `dt-app.css` ergänzen (die Datei folgt der Vorlage in `harness/`).

---

## 10. Asynchronität und Nullability

### Backend: `async`/`await` durchgängig, ohne `Async`-Suffix

**Regel:** Jede Controller-Aktion ist `async` und gibt `Task` zurück; es wird nie mit `.Result` oder
`.Wait()` blockiert. Die Methoden tragen **keinen** `Async`-Suffix (`API05`, `API06`; siehe
[`_code.md`, Abschnitt 5](../../harness/_code.md)). Dasselbe gilt für `TestData.Reset`.
**Warum:** Blockierendes Warten belegt Threads des Servers; der fehlende Suffix ist eine Projektfestlegung,
die NDepend prüft.

- ✅ `public async Task<IActionResult> DeletePet(int id)`
- ❌ `public IActionResult DeletePet(int id) { ... .Result }` oder `DeletePetAsync`

### Backend: Nullable ist aktiv, optionale Beziehung ist `int?`

**Regel:** Nicht-optionale Strings erhalten `= string.Empty`; eine optionale Beziehung ist ein `int?`-
Fremdschlüssel ohne Navigationseigenschaft (`Pet.PersonId`), und Mustervergleich mit `is { } l_x` entpackt
den Wert.
**Warum:** Der Compiler erkennt vergessene Null-Prüfungen; ein `is int l_x`-Test würde nur auf `null`
prüfen ([`_code.md`, Abschnitt 4](../../harness/_code.md)).

- ✅ `if (request.PersonId is { } l_pid) { ... }`
- ❌ `if (request.PersonId != null) { var id = request.PersonId.Value; ... }`

### Frontend: `async` in Handlern, `try/catch/finally` um Mutationen

**Regel:** Handler sind `async function`, Mutationen stehen in `try { ... } catch (err) { ... } finally {
... }`, der Ladeindikator (`saving`, `loading`) wird in `finally` zurückgesetzt. Effekte rufen
`async`-Funktionen auf, ohne selbst `async` zu sein (`useEffect(() => { loadAll() }, [])`).
**Warum:** Ein hängender Ladezustand nach einem Fehler sperrt den Dialog dauerhaft.

- ✅ `finally { setSaving(false) }` in `PersonForm.handleSubmit`
- ❌ `setSaving(false)` nur im Erfolgspfad.

### Frontend: Nullability über `??` und `?.`

**Regel:** Optionale Werte werden mit `?.` und `??` behandelt, nicht mit `||`; Zustandsvergleiche auf
„geschlossen" sind explizit `=== null` bzw. `!== null`.
**Warum:** `0` und `''` sind gültige Werte (Alter `0`); `||` würde sie überschreiben.

- ✅ `initial?.name ?? ''`, `formOpen !== null`
- ❌ `initial && initial.name || ''`

---

## Bewusste Abweichungen

`_design.md` und `_code.md` sind Vorgabe, der Code ist Ist-Stand. Die folgenden Punkte weichen am
2026-11-04 nachweislich ab; sie sind **keine** Regeln und bei neuem Code nicht nachzuahmen, solange die
Vorgabe nicht angepasst oder der Code korrigiert wird. Das Fachliche ist in
`specs/E1 Personen/_Backend.md` dokumentiert.

| # | Vorgabe | Ist-Stand im Code | Fundstelle |
|---|---|---|---|
| 1 | `_design.md` §5: Fehlerkörper sind `new { message = "…" }`, englische Sätze | `BadRequest("…")` mit **deutschem** String als Body | `PersonsController`, `PetsController`, `Program.cs` (Reset) |
| 2 | `_design.md` §5: `Update{X}` antwortet `200` mit Response-DTO | `UpdatePerson`/`UpdatePet` antworten `204 NoContent`, Rückgabetyp `Task<IActionResult>` | beide Controller |
| 3 | `_design.md` §5: Manuelle Reihenfolge über `SortOrder` und `PUT {id:int}/position` (`TargetIndex`, 1-basiert) | Feld heißt `Order`; Umsortieren über `PATCH reorder` mit `Ids`-Liste (`PersonPositionRequest`), Methode `UpdatePersonsPosition`; neue Person erhält `Count + 1`; Sortierung `Order`, dann `Name` | `Person`, `PersonsController`, `PersonDtos` |
| 4 | `_design.md` §5: Listen sortiert nach `Id`, Reads mit `AsNoTracking()` | `GetPersons` sortiert nach `Order`/`Name` ohne `AsNoTracking`; `GetPets` sortiert nach `Name`/`Id` ohne `AsNoTracking` | beide Controller |
| 5 | `_design.md` §5: Löschen prüft Abhängige (`AnyAsync`) und liefert `409` | Es gibt kein `409`. Eine Person wird ohne Abhängigkeitsprüfung gelöscht; die Haustier-Zuordnung löst `OnDelete(DeleteBehavior.SetNull)` | `PersonsController.DeletePerson`, `PetConfiguration` |
| 6 | `_design.md` §4: Beziehungen mit `DeleteBehavior.Restrict` | `Pet` → `Person` verwendet `SetNull` (optionale 1:1-Beziehung mit eindeutigem Index auf `PersonId`) | `PetConfiguration` |
| 7 | `_design.md` §4: Seed-Daten per `HasData` in jeder Konfiguration | Keine `HasData`-Seeds; ein deterministischer Basisdatensatz entsteht nur in `TestData.Reset` (Testbetrieb) | `PersonConfiguration`, `PetConfiguration`, `TestData` |
| 8 | `_design.md` §3: Grenzen per `[MaxLength]`, Fehlermeldung nicht vorgegeben | `[StringLength]` statt `[MaxLength]`, deutsche `ErrorMessage`-Texte; optionale Fremdschlüssel (`PetId`, `PersonId`) ohne Annotation, obwohl DTO04 mindestens `[Required]` je Request-Typ verlangt (erfüllt, da andere Properties es tragen) | `PersonDtos`, `PetDtos` |
| 9 | `_design.md` §1: CORS-Policy `FrontendCorsPolicy`, Verbindungszeichenfolge `DefaultConnection`, Swagger nur in Entwicklung | Policy heißt `AllowFrontend`, Verbindungszeichenfolge `PersonsDb`, statt Swagger `AddOpenApi`/`MapOpenApi` (nur in Entwicklung) | `Program.cs` |
| 10 | `_code.md` §6: Kommentare auf Englisch | XML-Doku und Kommentar in `TestData` sind deutsch; Kommentare in `code/factory` ebenfalls | `Data/TestData.cs`, `code/factory` |
| 11 | `_uiux.md`: klassenbasiert, keine ad-hoc-Werte | Einzelne Inline-Styles (`marginLeft`, `display: flex` für Dialogfuß, Drag-Overlay) in `App.jsx`, `PersonList.jsx`, `PetList.jsx` | `code/frontend/src` |
| 12 | keine ausdrückliche Vorgabe (Duplikate sind keine Regel) | `src/api/persons.js` und `src/api/pets.js` enthalten identische `request`-Funktionen; die beiden Löschdialoge in `App.jsx` sind Kopien | `code/frontend/src` |

Die Punkte 1–9 sind in `_design.md` als „nicht statisch prüfbar" geführt (Abschnitt 7) und werden daher
von `harness/analyse_swd.py` nicht gemeldet. Wird der Code angeglichen oder die Vorgabe geändert, entfällt
der jeweilige Eintrag in der Tabelle.
