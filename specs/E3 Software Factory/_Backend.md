# Backend — Software Factory

- Node.js mit Express (`code/factory/server/index.js`); die Oberfläche ist eine React-Anwendung, die der Dienst aus `code/factory/dist` ausliefert.
- Deployment: lokaler Dienst auf diesem Rechner, nicht in einem Container (siehe „Betrieb“).
- Alle Anfragen und Antworten sind JSON. Fehler entsprechen dem Format `{ "error": "Meldung" }`; die Oberfläche zeigt die Meldung an.

## Endpunkte: Übersicht (Basis `/api`)

| Methode | Route | Anfrage | Erfolg | Fehler |
|---|---|---|---|---|
| GET | `/events` | – | `200` Live-Kanal `text/event-stream` | – |
| GET | `/overview` | – | `200` Kennzahlen, Handlungsbedarf, Zähler für das Cockpit | – |
| GET | `/history` | – | `200` Ereignisse und letzte 100 Git-Versionen, neueste zuerst | – |
| GET | `/system` | – | `200` `{ checks, app, user }` | – |
| GET | `/settings` | – | `200` Einstellungen mit `models`, `dialogLabel`, `buildLabel` | – |
| PUT | `/settings` | `{ dialogModel, buildModel }` | `200` Einstellungen | `400` unbekanntes Modell |

## Endpunkte: Ideen (Basis `/api/ideas`)

| Methode | Route | Anfrage | Erfolg | Fehler |
|---|---|---|---|---|
| GET | `/` | – | `200` Ideen-Liste (nach Nummer) | – |
| GET | `/{id}` | – | `200` Idee mit `doc`, `messages`, `pendingQuestions`, `activity`, `costUsd`, `readinessLabels` | `404` |
| POST | `/` | `{ text }` | `201` `{ id }` | `400` |
| POST | `/{id}/message` | `{ text, answers }` | `202` `{ ok }` | `400`, `404`, `409` |
| POST | `/{id}/retry` | – | `202` `{ ok }` | `404`, `409` |
| PUT | `/{id}/document` | `{ title, problem, solution, inScope, outOfScope, openPoints }` | `200` `{ ok }` | `404`, `409` |
| POST | `/{id}/approve` | – | `200` `{ ok }` | `404`, `409` |
| POST | `/{id}/reopen` | – | `200` `{ ok }` | `404`, `409` |
| POST | `/{id}/transfer` | – | `202` `{ id }` des Auftrags | `404`, `409` |
| DELETE | `/{id}` | – | `200` `{ ok }` | `404`, `409` |

## Endpunkte: Anforderungen (Basis `/api/requirements`)

| Methode | Route | Anfrage | Erfolg | Fehler |
|---|---|---|---|---|
| GET | `/` | – | `200` `{ tree, locked }` | – |
| GET | `/{id}` | – | `200` Anforderung mit `history`, `origin`, `runs` | `404` |
| POST | `/` | `{ title, userStory, description, criteria, placement }` | `201` `{ id, path }` | `400`, `409` |
| POST | `/check` | `{ title, userStory, description, criteria }` | `200` `{ verdict, summary, findings }` | `400`, `500` KI-Fehler |
| PUT | `/{id}` | `{ title, userStory, description, criteria }` | `200` `{ id, path, changed, oldPath }` | `400`, `404`, `409` |
| DELETE | `/{id}` | – | `200` `{ ok }` | `404`, `409` |

Dazu gehört `GET /api/appendix/{epic}/{name}`: Es antwortet mit `200` und `{ markdown }`, bei einer unbekannten Unterlage mit `404`.

## Endpunkte: Anforderungs-Assistent (Basis `/api/studio`)

| Methode | Route | Anfrage | Erfolg | Fehler |
|---|---|---|---|---|
| GET | `/` | – | `200` offene Entwürfe (nach Nummer) | – |
| GET | `/{id}` | – | `200` Entwurf mit `readinessLabels`, `readyCount`, `readyTotal`, `waitingForUser` | `404` |
| POST | `/` | `{ text, storyId }` | `201` `{ id }` | `400`, `404` |
| POST | `/{id}/message` | `{ text, answers }` | `202` `{ ok }` | `400`, `404`, `409` |
| POST | `/{id}/retry` | – | `202` `{ ok }` | `404`, `409` |
| PUT | `/{id}/draft` | Felder von `draft` | `200` `{ ok }` | `404`, `409` |
| POST | `/{id}/save` | – | `200` `{ id, path }` | `400`, `404`, `409` |
| DELETE | `/{id}` | – | `200` `{ ok }` | `409` |

## Endpunkte: Aufträge (Basis `/api/runs`)

| Methode | Route | Anfrage | Erfolg | Fehler |
|---|---|---|---|---|
| GET | `/` | – | `200` Auftrags-Liste ohne `activity`, neueste zuerst | – |
| GET | `/{id}` | – | `200` Auftrag mit den letzten 600 Einträgen in `activity` | `404` |
| POST | `/` | `{ storyIds }` | `202` `{ id }` | `404`, `409` |
| POST | `/{id}/cancel` | – | `200` `{ ok }` | `404`, `409` |
| POST | `/{id}/discard` | – | `200` `{ ok }` | `404`, `409` |
| POST | `/{id}/revert` | – | `202` `{ id }` | `404`, `409` |
| POST | `/{id}/retry` | – | `202` `{ id }` | `404`, `409` |

## Weitere Routen

- Eine unbekannte Adresse unter `/api` antwortet mit `404` und „Unbekannte Adresse.“.
- Eine unlesbare Anfrage antwortet mit `400` und „Die Anfrage konnte nicht gelesen werden.“.
- Ein unerwarteter Fehler antwortet mit `500` und seiner Meldung, ersatzweise „Es ist ein unerwarteter Fehler aufgetreten.“.
- `GET /` liefert die gebaute Oberfläche aus `code/factory/dist`.
- Fehlt die gebaute Oberfläche, antwortet `GET /` mit `503` und „Die Oberfläche ist noch nicht gebaut. Bitte führen Sie „npm run build“ aus.“.

## Rechteprofile der KI

Die Factory startet die KI als Unterprozess `claude` im Stammordner des Repositories. Für jeden Arbeitsschritt gilt genau ein Profil.

| Profil | Einsatz | Werkzeuge | Erlaubt | Verboten |
|---|---|---|---|---|
| `read` | Ideen-Dialog, Anforderungs-Assistent, Qualitätsprüfung | `Read`, `Glob`, `Grep` | nur lesen | – |
| `specs` | Überführung einer Idee | `Read`, `Glob`, `Grep`, `Edit`, `Write` | lesen; schreiben unter `specs/**` | – |
| `build` | Umsetzung, Nachbesserung | `Read`, `Glob`, `Grep`, `Edit`, `Write`, `Bash` | lesen; schreiben unter `code/**`, `specs/**` und in `docker-compose.yml`; Befehle `npm`, `npx`, `dotnet` | schreiben unter `code/factory/**`; Befehle `git`, `docker` |

- Das Profil `build` kennt bewusst nur die Shell `Bash`: Sie zerlegt verkettete Befehle und prüft jeden Teil einzeln gegen die Regeln.
- Für jeden Lauf gelten `--strict-mcp-config` mit einer leeren MCP-Konfiguration: Angebundene Systeme des Anwenders stehen der KI nicht zur Verfügung.
- Für jeden Lauf gilt `--setting-sources project,local`: Globale Einstellungen und Hooks des Anwenders bleiben außen vor.
- Für jeden Lauf gelten `--disable-slash-commands`, `--no-session-persistence`, `--permission-mode dontAsk` und `--permission-prompts none`.
- Die Factory entfernt die Umgebungsvariablen `CLAUDECODE` und `CLAUDE_CODE_*`, bevor sie die KI startet.
- Die KI liefert ihr Ergebnis über ein festes Schema (`--json-schema`).
- Vom Profil blockierte Aktionen meldet die Factory im Arbeitsprotokoll.
- Die Factory prüft die Grenzen nach einem schreibenden Lauf zusätzlich gegen den Git-Stand (siehe F6 S2 und F10 S3).
- Sichern und Ausliefern führt der Dienst selbst aus; die KI führt weder `git` noch `docker` aus.

| Arbeitsschritt | Profil | Modell | Arbeitstiefe | Zeitlimit |
|---|---|---|---|---|
| Gesprächsrunde | `read` | `dialogModel` | `medium` | 5 Minuten |
| Qualitätsprüfung | `read` | `dialogModel` | `medium` | 5 Minuten |
| Überführung | `specs` | `buildModel` | `high` | 30 Minuten |
| Umsetzung | `build` | `buildModel` | `high` | 90 Minuten |
| Nachbesserung | `build` | `buildModel` | `high` | 30 Minuten |

- Die Regeln liest die Factory zur Laufzeit aus `harness/_ideas.md` und `harness/_requirements.md`.
- Der Themenbereich „Software Factory“ (`TOOL_EPICS`) lässt sich nicht über die Factory ändern oder umsetzen: Sie würde sich sonst im laufenden Betrieb selbst ändern.

## Zugriffsschutz

Der Dienst kann Programmcode ändern und ausliefern und hat keine Anmeldung. Deshalb gelten diese Regeln für jede Anfrage:

- Der Dienst nimmt Verbindungen nur auf `127.0.0.1` an.
- Der `Host` einer Anfrage muss `localhost` oder `127.0.0.1` mit Port 4000 oder dem Vite-Port 5174 sein, sonst antwortet er mit `403` und „Zugriff nur lokal erlaubt.“.
- Ein vorhandener `Origin` muss denselben Regeln entsprechen, sonst antwortet er mit `403` und „Zugriff nur lokal erlaubt.“. Das wehrt DNS-Rebinding und CSRF aus dem Browser ab.
- Jede Anfrage außer GET und HEAD muss den Inhaltstyp `application/json` tragen, sonst antwortet er mit `415` und „Ungültiges Anfrageformat.“.
- Kennungen aus der Adresse werden geprüft, bevor sie Teil eines Dateipfads werden: `L{n}` für Aufträge, `I{n}` und `A{n}` für Sitzungen.

## Betrieb

- Der Dienst läuft lokal auf dem Rechner des Anwenders auf Port 4000 (`http://localhost:4000`); `FACTORY_PORT` ändert den Port.
- `SoftwareFactory.cmd` im Stammordner installiert bei Bedarf die Abhängigkeiten, baut die Oberfläche, öffnet den Browser und startet den Dienst.
- `npm start` in `code/factory` startet nur den Dienst.
- `npm run dev` startet die Oberfläche im Entwicklungsmodus auf Port 5174 und leitet `/api` an den Dienst weiter.
- Beim Start beendet der Dienst unterbrochene Gesprächsrunden und Aufträge (siehe F4 S8 und F10 S2).
- Der Dienst beobachtet `specs/` und `ideas/` und meldet Änderungen live (siehe F1 S3).

**Warum nicht im Container:** Die Factory steuert `claude`, `git` und `docker` mit dem Login des Anwenders. In einem Container gäbe es diese Anmeldungen und den Zugriff auf das Repository und die Docker-Umgebung des Rechners nicht. Die Factory ist deshalb nicht Teil von `docker-compose.yml`; dort steht nur die Anwendung, die sie ausliefert.

## Domain Events

Jedes Ereignis wird als Zeile in `events.jsonl` persistiert und erscheint im Verlauf (siehe F11 S1).

| `type` | `title` | `ref` |
|---|---|---|
| `idea` | `Idee {id} erfasst` | `idea` |
| `idea` | `Idee {id} »{Titel}« freigegeben` | `idea` |
| `idea` | `Idee {id} »{Titel}« erneut geöffnet` | `idea` |
| `idea` | `Idee {id} »{Titel}« verworfen` | – |
| `requirement` | `Anforderung {id} »{Titel}« angelegt` | `story` |
| `requirement` | `Anforderung {id} »{Titel}« geändert` | `story` |
| `requirement` | `Anforderung {id} »{Titel}« entfernt` | – |
| `requirement` | `Anforderung {id} »{Titel}« mit dem Assistenten angelegt` | `story` |
| `requirement` | `Anforderung {id} »{Titel}« mit dem Assistenten überarbeitet` | `story` |
| `run` | `Überführung {id} für Idee {Idee} »{Titel}« beauftragt` | `run`, `idea` |
| `run` | `Idee {Idee} »{Titel}« in {n} Anforderungen überführt` | `run`, `idea` |
| `run` | `Umsetzung {id} beauftragt ({n} Anforderungen)` | `run` |
| `run` | `Rücknahme {id} der Auslieferung {Ziel} beauftragt` | `run` |
| `run` | `Überführung {id} »{Titel}« abgebrochen` oder `fehlgeschlagen` | `run` |
| `run` | `Umsetzung {id} abgebrochen` oder `fehlgeschlagen` | `run` |
| `run` | `Rücknahme {id} abgebrochen` oder `fehlgeschlagen` | `run` |
| `run` | `Änderungen aus {id} verworfen` | `run` |
| `delivery` | `Umsetzung {id} ausgeliefert ({k} von {n} Anforderungen)` | `run` |
| `delivery` | `Auslieferung {Ziel} zurückgenommen` | `run` |

## Live-Meldungen

Der Live-Kanal `GET /api/events` sendet Meldungen mit den Feldern `topic` und `id`.

| `topic` | Auslöser |
|---|---|
| `ideas` | Eine Idee oder ihr Gespräch ändert sich, Änderungen unter `ideas/`, Ende eines Auftrags |
| `requirements` | Eine Anforderung ändert sich, Änderungen unter `specs/`, Ende eines Auftrags, Verwerfen eines Auftrags |
| `runs` | Ein Auftrag ändert sich |
| `studio` | Ein Entwurf ändert sich |
| `settings` | Die Einstellungen ändern sich |

## Git-Versionen

Der Dienst erzeugt diese Versionen selbst. Jede endet mit `Co-Authored-By: Claude {Modell} <noreply@anthropic.com>`; `git revert` verwendet die Standardnachricht von Git.

| Vorgang | Betreff |
|---|---|
| Idee freigeben | `idee: {id} {Titel} freigegeben` |
| Idee verwerfen | `idee: {id} {Titel} verworfen` |
| Idee überführen | `idee: {id} {Titel} in anforderungen überführt` |
| Anforderung anlegen | `anforderung: {id} {Titel} angelegt` |
| Anforderung ändern | `anforderung: {id} geändert` |
| Anforderung überarbeiten | `anforderung: {id} überarbeitet` |
| Anforderung entfernen | `anforderung: {id} {Titel} entfernt` |
| Umsetzung sichern | `umsetzung: {Kennungen}` |
| Umsetzung ohne fertige Anforderung | `umsetzung: {id} teilweise, keine anforderung abgeschlossen` |
| Nachbesserung sichern | `umsetzung: {id} nachbesserung` |
