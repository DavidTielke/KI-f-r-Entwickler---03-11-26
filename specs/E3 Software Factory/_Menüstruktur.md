# Menüstruktur — Software Factory

```
Steuerung
└── Cockpit (Standard-Ansicht)
Fertigung
├── Ideen (mit Zähler)
├── Anforderungen (mit Zähler)
└── Umsetzung (mit Aktivitätsmarkierung)
Transparenz
├── Verlauf
└── Einstellungen
```

- Die Sidebar enthält die Navigationsgruppen „Steuerung“, „Fertigung“ und „Transparenz“.
- Oben in der Sidebar steht die Marke „Software//Factory“ mit dem Zusatz „Von der Idee zur Auslieferung“ (siehe F1 S1).
- Der Eintrag „Cockpit“ ist die Standard-Ansicht. Eine leere oder unbekannte Adresse zeigt das Cockpit.
- Am Eintrag „Ideen“ steht ein Zähler mit der Anzahl der Ideen in den Status `Draft` und `Ready` (`nav.ideasOpen`).
- Am Eintrag „Anforderungen“ steht ein Zähler mit der Anzahl der offenen Anforderungen ohne Werkzeug-Themenbereiche (`nav.requirementsOpen`).
- Ein Zähler mit dem Wert 0 ist nicht sichtbar.
- Der Eintrag „Anforderungen“ wird auch im Anforderungs-Assistenten aktiv markiert.
- Der Eintrag „Umsetzung“ trägt keinen Zähler, sondern eine Aktivitätsmarkierung, solange ein Auftrag wartet oder läuft (`nav.runsActive`).
- Unter der Navigation steht der Betriebsstatus der Anwendung mit Verweis auf `appUrl` (siehe F1 S2).
- Unten in der Sidebar steht der Anwender aus der Git-Einstellung `user.name` mit der Rolle „Fachbereich“ (siehe F1 S1).
- Die Zähler und die Aktivitätsmarkierung aktualisieren sich live (siehe F1 S3).

## Adressen

| Adresse | Ansicht | Aktiver Eintrag | Story |
|---|---|---|---|
| `#/` | Cockpit | „Cockpit“ | F2 |
| `#/cockpit` | Cockpit | „Cockpit“ | F2 |
| `#/ideen` | Ideen-Tafel | „Ideen“ | F3 S1 |
| `#/ideen?neu=1` | Ideen-Tafel mit Dialog „Idee erfassen“ | „Ideen“ | F3 S2 |
| `#/ideen/{id}` | Ideen-Dialog | „Ideen“ | F4 |
| `#/anforderungen` | Anforderungsliste | „Anforderungen“ | F7 S1 |
| `#/anforderungen?filter=offen` | Anforderungsliste mit Filter „Umsetzung offen“ | „Anforderungen“ | F7 S2 |
| `#/anforderungen?filter=umgesetzt` | Anforderungsliste mit Filter „Umgesetzt“ | „Anforderungen“ | F7 S2 |
| `#/anforderungen/{id}` | Anforderungs-Detail | „Anforderungen“ | F7 S3 |
| `#/assistent/{id}` | Anforderungs-Assistent | „Anforderungen“ | F8 S2 |
| `#/umsetzung` | Warteschlange und Aufträge | „Umsetzung“ | F10 S2 |
| `#/umsetzung/{id}` | Auftrag | „Umsetzung“ | F10 S3 |
| `#/verlauf` | Verlauf | „Verlauf“ | F11 S1 |
| `#/einstellungen` | Einstellungen | „Einstellungen“ | F12 |

## Einordnung in der Oberfläche

- Der Themenbereich „Software Factory“ gehört zu den Werkzeug-Themenbereichen (`TOOL_EPICS`). In der Anforderungsliste steht er unter der Gruppe „Werkzeug“ (siehe F7 S2).
- Er zählt nicht in die Kennzahlen, Zähler und Diagramme.
- Seine Anforderungen lassen sich in der Factory lesen, aber weder ändern noch umsetzen.
