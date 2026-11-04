# Struktur und Filter

## Meta
- **State:** Implemented

## User Story
Als Fachbereich möchte ich die Anforderungen nach Themenbereich, Funktion, Status und Suchbegriff eingrenzen, damit ich schnell die passenden Anforderungen finde.

## Description
Links neben der Tabelle steht die Struktur aus Themenbereichen und Funktionen mit ihrem Fortschritt. Über der Tabelle stehen Suche und Statusfilter. Alle Einschränkungen wirken zusammen.

## Akzeptanzkriterien
### Themenbereiche
- Die Karte zeigt die Dachzeile „Struktur“.
- Die Karte zeigt den Titel „Themenbereiche.“.
- Der Eintrag „Alle Themenbereiche“ hebt die Einschränkung auf.
- Der Eintrag „Alle Themenbereiche“ ist ohne Einschränkung aktiv markiert.
- Ein Themenbereich zeigt seinen Namen.
- Ein Themenbereich zeigt den Stand im Format `{umgesetzt}/{gesamt}`.
- Ein Themenbereich zeigt einen Fortschrittsbalken.
- Ein Klick auf einen Themenbereich schränkt die Liste auf ihn ein.
- Ein Klick auf einen Themenbereich klappt seine Funktionen auf.
- Es ist höchstens ein Themenbereich aufgeklappt.
- Eine Funktion mit offenen Anforderungen zeigt deren Anzahl.
- Eine Funktion ohne offene Anforderungen zeigt keinen Zähler.
- Ein Klick auf eine Funktion schränkt die Liste auf diese Funktion ein.

### Werkzeug
- Themenbereiche aus `TOOL_EPICS` stehen in einer eigenen Gruppe „Werkzeug“.
- Der Themenbereich „Software Factory“ gehört zu `TOOL_EPICS`.
- Anforderungen eines Werkzeug-Themenbereichs erscheinen nur in der Liste, wenn dieser Themenbereich ausgewählt ist.

### Suche
- Das Suchfeld zeigt den Platzhalter „Anforderungen durchsuchen“.
- Die Suche ignoriert Groß- und Kleinschreibung.
- Die Suche durchsucht `title`, `userStory`, `description`, `featureName`, `epicName` und `id`.
- Die Suche durchsucht die Abnahmekriterien nicht.

### Status
- Der Statusfilter bietet „Alle“, „Umsetzung offen“ und „Umgesetzt“.
- Ohne Vorgabe ist „Alle“ aktiv.
- „Umsetzung offen“ zeigt alle Anforderungen, deren `state` nicht `Implemented` ist.
- „Umgesetzt“ zeigt alle Anforderungen im Status `Implemented`.
- Die Adresse `#/anforderungen?filter=offen` aktiviert „Umsetzung offen“.
- Die Adresse `#/anforderungen?filter=umgesetzt` aktiviert „Umgesetzt“.
- Themenbereich, Funktion, Suche und Status wirken gleichzeitig.
