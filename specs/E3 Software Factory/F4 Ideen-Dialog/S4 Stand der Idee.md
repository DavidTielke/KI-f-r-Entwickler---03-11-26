# Stand der Idee

## Meta
- **State:** Implemented

## User Story
Als Fachbereich möchte ich jederzeit den aktuellen Inhalt des Ideen-Dokuments lesen, damit ich sehe, was der Product Owner verstanden und festgehalten hat.

## Description
Im Seitenbereich des Ideen-Dialogs steht der aktuelle Stand des Ideen-Dokuments. Es wird während des Gesprächs laufend fortgeschrieben. Die Auswirkungen auf die Anwendung lassen sich aufklappen.

## Akzeptanzkriterien
### Abschnitte
- Die Karte zeigt die Dachzeile „Dokument“.
- Die Karte zeigt den Titel „Stand der Idee.“.
- Der Abschnitt „Problem und Nutzen“ zeigt das Feld `problem`.
- Der Abschnitt „Lösungsidee“ zeigt das Feld `solution`.
- Der Abschnitt „Das gehört dazu“ zeigt das Feld `inScope`.
- Der Abschnitt „Das gehört nicht dazu“ zeigt das Feld `outOfScope`.
- Der Abschnitt „Entscheidungen“ zeigt das Feld `decisions` als Liste.
- Der Abschnitt „Offene Punkte“ zeigt das Feld `openPoints` als Liste.
- Ein leerer Textabschnitt zeigt „Noch offen“.
- Der Platzhalter „…“ aus der Ideen-Datei gilt als leer.
- Ein leerer Abschnitt „Entscheidungen“ zeigt „Noch keine Entscheidungen“.
- Ein leerer Abschnitt „Offene Punkte“ zeigt „Keine offenen Punkte“.
- Text in Backticks erscheint als Code-Auszeichnung.
- Text zwischen doppelten Sternen erscheint fett.

### Auswirkungen auf die Anwendung
- Der aufklappbare Bereich „Auswirkungen auf die Anwendung“ ist beim Öffnen zugeklappt.
- Aufgeklappt zeigt der Abschnitt „Anforderungen“ das Feld `impactSpecs`.
- Aufgeklappt zeigt der Abschnitt „Gespeicherte Daten“ das Feld `impactData`.
- Aufgeklappt zeigt der Abschnitt „Serverlogik“ das Feld `impactBackend`.
- Aufgeklappt zeigt der Abschnitt „Programmcode“ das Feld `impactCode`.

### Überführung
- Der Abschnitt „Überführung“ ist nur sichtbar, wenn das Feld `transfer` Einträge enthält.
- Der Abschnitt „Überführung“ zeigt das Feld `transfer` als Liste.

### Datei
- Die Ideen-Datei entspricht dem Format `ideas/I{n} {Titel}.md`.
- Die Nummer einer Idee bleibt bei einer Titeländerung stabil.
- Der Dateiname folgt dem aktuellen Titel der Idee.
- Der Inhalt der Datei folgt dem Ideen-Format aus `harness/_ideas.md` (siehe `_Datenstruktur.md`).
