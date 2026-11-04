# Datenstruktur — Software Factory

Die Software Factory hat keine Datenbank. Quelle der Wahrheit sind die Markdown-Dateien in `ideas/` und `specs/`, die auch ohne die Factory lesbar und bearbeitbar bleiben. Arbeitsdaten wie Gesprächsverläufe, Aufträge, Ereignisse und Einstellungen liegen als JSON-Dateien unter `code/factory/data/`. Dieser Ordner entsteht bei Bedarf und ist von Git ausgenommen.

## Anforderung (Datei `specs/E{n} {Themenbereich}/F{n} {Funktion}/S{n} {Titel}.md`)

Format nach `harness/_requirements.md`.

| Feld | Typ | Pflicht | Max. | Anmerkung |
|---|---|---|---|---|
| `title` | text | ja | 120 | H1 der Datei |
| `state` | text (Enum) | ja | – | Abschnitt `## Meta`: `Modified` oder `Implemented` |
| `userStory` | text | ja | – | Abschnitt `## User Story` |
| `description` | text | nein | – | Abschnitt `## Description` |
| `criteria` | Liste | ja | – | Abschnitt `## Akzeptanzkriterien`, Gruppen aus `heading` und `items` |

Das Backend ergänzt beim Lesen diese abgeleiteten Felder:

| Feld | Typ | Anmerkung |
|---|---|---|
| `id` | text | Format `E{n}-F{n}-S{n}` aus dem Dateipfad |
| `number` | int | Nummer der Anforderung innerhalb der Funktion |
| `path` | text | Pfad relativ zum Repository |
| `criteriaCount` | int | Anzahl der Einträge in `items` über alle Gruppen |
| `epicNumber`, `epicName` | int, text | Themenbereich aus dem Ordnernamen |
| `featureNumber`, `featureName` | int, text | Funktion aus dem Ordnernamen |
| `isTool` | bool | Wahr bei einem Themenbereich aus `TOOL_EPICS` |

## Unterlage (Datei `specs/E{n} {Themenbereich}/_{Name}.md`)

- Zu einem Themenbereich gehören die Unterlagen `_Datenstruktur.md`, `_Menüstruktur.md` und `_Backend.md`.
- Die Factory zeigt jede Datei `_{Name}.md` direkt im Ordner des Themenbereichs lesend an.

## Idee (Datei `ideas/I{n} {Titel}.md`)

Format nach `harness/_ideas.md`.

| Feld | Typ | Pflicht | Max. | Anmerkung |
|---|---|---|---|---|
| `title` | text | ja | – | H1 der Datei; der Dateiname folgt dem Titel |
| `state` | text (Enum) | ja | – | Abschnitt `## Meta`: `Draft`, `Ready` oder `Übernommen` |
| `problem` | text | nein | – | Abschnitt `## Problem` |
| `solution` | text | nein | – | Abschnitt `## Lösungsidee` |
| `inScope` | text | nein | – | Abschnitt `## Scope`, Eintrag `In Scope` |
| `outOfScope` | text | nein | – | Abschnitt `## Scope`, Eintrag `Out of Scope` |
| `impactSpecs` | text | nein | – | Abschnitt `## Auswirkungen auf den Bestand`, Eintrag `Specs` |
| `impactData` | text | nein | – | Abschnitt `## Auswirkungen auf den Bestand`, Eintrag `Datenstruktur` |
| `impactBackend` | text | nein | – | Abschnitt `## Auswirkungen auf den Bestand`, Eintrag `Backend` |
| `impactCode` | text | nein | – | Abschnitt `## Auswirkungen auf den Bestand`, Eintrag `Quellcode` |
| `decisions` | Liste (text) | nein | – | Abschnitt `## Entscheidungen`, Einträge im Format `{Datum}: {Entscheidung}` |
| `openPoints` | Liste (text) | nein | – | Abschnitt `## Offene Punkte`; `(leer)` steht für keine Einträge |
| `transfer` | Liste (text) | nein | – | Abschnitt `## Übergang zu Specs`; nur vorhanden, wenn Einträge existieren |

- Leere Pflichtabschnitte schreibt das Backend mit dem Platzhalter `…`. Die Oberfläche behandelt ihn als leer.

## Sitzung (Datei `code/factory/data/sessions/{id}.json`)

Eine Sitzung hält das Gespräch einer Idee (`I{n}`) oder eines Entwurfs des Anforderungs-Assistenten (`A{n}`).

| Feld | Typ | Pflicht | Max. | Anmerkung |
|---|---|---|---|---|
| `id` | text | ja | – | `I{n}` oder `A{n}` |
| `kind` | text (Enum) | ja | – | `idea` oder `studio` |
| `createdAt` | Zeitstempel | ja | – | ISO-Format |
| `updatedAt` | Zeitstempel | ja | – | ISO-Format, bei jedem Speichern gesetzt |
| `messages` | Liste | ja | – | Gesprächsverlauf, siehe Nachricht |
| `pendingQuestions` | Liste | ja | 3 | Offene Rückfragen, siehe Rückfrage |
| `readiness` | Objekt | ja | – | Reifegrad-Werte der letzten KI-Runde |
| `busy` | bool | ja | – | Wahr, solange eine KI-Runde wartet oder läuft |
| `activity` | Liste | ja | 30 | Arbeitsschritte der laufenden KI-Runde |
| `error` | text | nein | – | Meldung der letzten gescheiterten Runde |
| `costUsd` | Zahl | ja | – | Summierter Aufwand der KI-Runden |
| `phase` | text (Enum) | nur `idea` | – | `verstehen`, `hinterfragen`, `machbarkeit`, `verfeinern` oder `abschliessen` |
| `number` | int | nur `studio` | – | Laufende Nummer des Entwurfs |
| `status` | text (Enum) | nur `studio` | – | `open` oder `saved` |
| `draft` | Objekt | nur `studio` | – | Entwurf mit `title`, `userStory`, `description`, `criteria` und `placement` |
| `storyId` | text | nein | – | Nur `studio`: überarbeitete Anforderung, sonst leer |
| `savedStory` | text | nein | – | Nur `studio`: Kennung der gespeicherten Anforderung |

### Nachricht (Einträge von `messages`)

| Feld | Typ | Pflicht | Max. | Anmerkung |
|---|---|---|---|---|
| `role` | text (Enum) | ja | – | `user` oder `assistant` |
| `text` | text | ja | – | Inhalt der Nachricht |
| `at` | Zeitstempel | ja | – | ISO-Format |
| `answers` | Liste | nein | – | Nur `user`: beantwortete Rückfragen mit `header`, `question` und `answer` |
| `questions` | Liste | nein | 3 | Nur `assistant`: gestellte Rückfragen |

### Rückfrage (Einträge von `pendingQuestions` und `questions`)

| Feld | Typ | Pflicht | Max. | Anmerkung |
|---|---|---|---|---|
| `header` | text | ja | – | Kurzes Thema der Rückfrage |
| `question` | text | ja | – | Text der Rückfrage |
| `multiSelect` | bool | nein | – | Wahr bei Mehrfachauswahl |
| `options` | Liste | ja | 4 | Mindestens 2 Einträge mit `label`, `description` und optional `recommended` |

### Einordnung (Feld `placement` von `draft`)

| Feld | Typ | Pflicht | Max. | Anmerkung |
|---|---|---|---|---|
| `epicNumber` | int | nein | – | Leer bei einem neuen Themenbereich |
| `epicName` | text | ja | – | Name des Themenbereichs |
| `featureNumber` | int | nein | – | Leer bei einer neuen Funktion |
| `featureName` | text | ja | – | Name der Funktion |

## Auftrag (Datei `code/factory/data/runs/L{n}.json`)

| Feld | Typ | Pflicht | Max. | Anmerkung |
|---|---|---|---|---|
| `id` | text | ja | – | `L{n}` |
| `type` | text (Enum) | ja | – | `transfer`, `delivery` oder `revert` |
| `title` | text | ja | – | Titel der Idee oder der Anforderung, `{n} Anforderungen` oder `Rücknahme von {id}` |
| `status` | text (Enum) | ja | – | `queued`, `running`, `done`, `partial`, `failed` oder `canceled` |
| `queuedAt` | Zeitstempel | ja | – | Zeitpunkt der Beauftragung |
| `startedAt` | Zeitstempel | nein | – | Zeitpunkt des Starts |
| `endedAt` | Zeitstempel | nein | – | Zeitpunkt des Endes |
| `phases` | Liste | ja | – | Einträge mit `key`, `label`, `status`, `startedAt` und `endedAt` |
| `activity` | Liste | ja | 1500 | Einträge mit `kind`, `text`, `detail`, `change` und `at` |
| `stories` | Liste | ja | – | Einträge mit `id`, `title`, `path`, `done` und `note` |
| `summary` | text | ja | – | Zusammenfassung in Fachsprache, anfangs leer |
| `error` | text | nein | – | Meldung bei `failed` oder `canceled` |
| `errorDetail` | text | nein | – | Technische Details zum Fehler |
| `commit` | text | nein | – | Kurzkennung der letzten Git-Version des Auftrags |
| `commits` | text[] | nein | – | Alle Git-Versionen des Auftrags einschließlich der Nachbesserungen |
| `workStarted` | bool | nein | – | Wahr, sobald der Auftrag die Vorbereitung bestanden hat |
| `baseCommit` | text | nein | – | Kurzkennung des Ausgangsstands |
| `changes` | Objekt | nein | – | Nur `delivery`: `files`, `areas`, `added` und `removed` |
| `costUsd` | Zahl | ja | – | Summierter Aufwand der KI-Läufe |
| `repairs` | int | ja | – | Anzahl der Nachbesserungen |
| `canDiscard` | bool | ja | – | Wahr, wenn verwerfbare Änderungen vorliegen |
| `revertedBy` | text | nein | – | Kennung der Rücknahme |
| `discarded` | bool | nein | – | Wahr, nachdem die Änderungen verworfen wurden |
| `ideaId` | text | nein | – | Nur `transfer`: Kennung der Idee |
| `storyPaths` | Liste (text) | nein | – | Nur `transfer`: Pfade der entstandenen Anforderungen |
| `targetRun` | text | nein | – | Nur `revert`: Kennung der zurückgenommenen Umsetzung |
| `targetCommits` | text[] | nein | – | Nur `revert`: zurückgenommene Git-Versionen, die jüngste zuerst |

### Phasen je Auftragstyp

| Typ | Phasen (`key` = Bezeichnung) |
|---|---|
| `transfer` | `vorbereitung` = Vorbereitung, `ausformulierung` = Ausformulierung, `pruefung` = Formprüfung, `sicherung` = Sicherung |
| `delivery` | `vorbereitung` = Vorbereitung, `umsetzung` = Umsetzung, `pruefung` = Prüfung, `sicherung` = Sicherung, `auslieferung` = Auslieferung, `abnahme` = Betriebsprüfung |
| `revert` | `vorbereitung` = Vorbereitung, `ruecknahme` = Rücknahme, `auslieferung` = Auslieferung, `abnahme` = Betriebsprüfung |

- Eine Phase hat den `status` `pending`, `active`, `done` oder `failed`.
- Ein Eintrag in `activity` hat die `kind` `narration`, `step` oder `hint`.

## Ereignis (Zeile in `code/factory/data/events.jsonl`)

Je Zeile steht ein JSON-Objekt. Die Datei wird nur fortgeschrieben.

| Feld | Typ | Pflicht | Max. | Anmerkung |
|---|---|---|---|---|
| `at` | Zeitstempel | ja | – | ISO-Format |
| `type` | text (Enum) | ja | – | `idea`, `requirement`, `run` oder `delivery` |
| `title` | text | ja | – | Beschreibung in Fachsprache |
| `ref` | Objekt | nein | – | Bezug über `idea`, `story` oder `run`; bei entfernten Vorgängen leer |

Die Ereignisse im Einzelnen stehen in `_Backend.md`.

## Einstellungen (Datei `code/factory/data/settings.json`)

| Feld | Typ | Pflicht | Max. | Anmerkung |
|---|---|---|---|---|
| `dialogModel` | text | ja | – | KI-Modell für Gespräche und Prüfungen, Standard `claude-sonnet-5-5` |
| `buildModel` | text | ja | – | KI-Modell für Ausformulierung und Umsetzung, Standard `claude-opus-5-5` |
| `appUrl` | text | ja | – | Adresse der Anwendung, Standard `FACTORY_APP_URL` oder `http://localhost:3000` |
| `healthPaths` | Liste (text) | ja | – | Adressen der Betriebsprüfung, Standard `/` und `/api/persons` |

- Fehlt die Datei oder ein Feld, gilt der Standardwert.
- `dialogModel` und `buildModel` nehmen einen der Werte `claude-haiku-5-5`, `claude-sonnet-5-5`, `claude-opus-5-5` oder `claude-fable-5-1` an.
- `appUrl` und `healthPaths` lassen sich nur direkt in der Datei ändern.

## Browser-Speicher

| Schlüssel | Speicher | Inhalt |
|---|---|---|
| `software-factory.voice` | `localStorage` | JSON mit `voiceName` und `rate` |
| `software-factory.voice-mode` | `sessionStorage` | `1` oder `0`; einmalige Übergabe in den Gesprächsmodus |

## Regeln

- Es gibt keine Datenbank; die Dateien sind die einzige Ablage.
- Das Backend schreibt Dateien über eine temporäre Datei und anschließendes Umbenennen.
- Das Backend wiederholt Dateizugriffe bei kurzzeitigen Sperren bis zu 6-mal.
- Nummern von Ideen, Funktionen und Anforderungen bleiben bei Änderungen stabil; neue Einträge erhalten die höchste vorhandene Nummer plus eins.
- Eine inhaltliche Änderung an einer Anforderung über die Factory setzt ihren Status auf `Modified`.
- Repository, Datenordner, Port und Adresse der Anwendung lassen sich per Umgebungsvariable umlenken: `FACTORY_REPO`, `FACTORY_DATA`, `FACTORY_PORT` und `FACTORY_APP_URL`.
