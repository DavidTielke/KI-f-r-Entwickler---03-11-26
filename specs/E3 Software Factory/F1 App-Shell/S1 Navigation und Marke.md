# Navigation und Marke

## Meta
- **State:** Implemented

## User Story
Als Fachbereich möchte ich über eine feste Seitenleiste jeden Bereich der Software Factory erreichen, damit ich jederzeit weiß, wo ich bin und wohin ich wechseln kann.

## Description
Die Seitenleiste zeigt oben die Marke, darunter die Navigationsgruppen und ganz unten den Anwender. Zähler und Markierungen an den Einträgen zeigen, wo Arbeit wartet. Die Gliederung und alle Adressen stehen in `_Menüstruktur.md`.

## Akzeptanzkriterien
### Marke
- Die Seitenleiste zeigt die Marke „Software//Factory“.
- Unter der Marke steht der Zusatz „Von der Idee zur Auslieferung“.
- Ein Klick auf die Marke öffnet das Cockpit unter `#/`.
- Der Browser-Tab trägt den Titel „Software Factory“.

### Navigation
- Die Navigation enthält die Gruppe „Steuerung“ mit dem Eintrag „Cockpit“.
- Die Navigation enthält die Gruppe „Fertigung“ mit den Einträgen „Ideen“, „Anforderungen“ und „Umsetzung“.
- Die Navigation enthält die Gruppe „Transparenz“ mit den Einträgen „Verlauf“ und „Einstellungen“.
- Der Eintrag des aktuellen Bereichs ist aktiv markiert.
- Der Eintrag „Anforderungen“ ist auch im Anforderungs-Assistenten unter `#/assistent/{id}` aktiv markiert.
- Eine Adresse ohne Bereich zeigt das Cockpit.
- Eine unbekannte Adresse zeigt das Cockpit.
- Bei einer unbekannten Adresse ist kein Eintrag aktiv markiert.

### Zähler und Markierungen
- Der Eintrag „Ideen“ zeigt als Zähler die Anzahl der Ideen in den Status `Draft` und `Ready` (`nav.ideasOpen`).
- Der Eintrag „Anforderungen“ zeigt als Zähler die Anzahl der offenen Anforderungen ohne Werkzeug-Themenbereiche (`nav.requirementsOpen`).
- Ein Zähler mit dem Wert 0 ist nicht sichtbar.
- Der Eintrag „Umsetzung“ zeigt eine Aktivitätsmarkierung, solange mindestens ein Auftrag wartet oder läuft (`nav.runsActive`).
- Der Eintrag „Umsetzung“ zeigt keinen Zähler.

### Anwender
- Unten in der Seitenleiste steht der Name aus der Git-Einstellung `user.name`.
- Ist kein Name hinterlegt, steht dort „Fachbereich“.
- Unter dem Namen steht die Rolle „Fachbereich“.
- Das Kürzel besteht aus den Anfangsbuchstaben der ersten beiden Namensteile in Großschreibung.
