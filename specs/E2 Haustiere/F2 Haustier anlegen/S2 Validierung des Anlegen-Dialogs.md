# Validierung des Anlegen-Dialogs

## Meta
- **State:** Implemented

## User Story
Als Administration möchte ich ungültige Eingaben vor dem Absenden erkennen, damit ich keine fehlerhaften Haustiere anlege.

## Description
Der Anlegen-Dialog validiert die Felder clientseitig als UX-Hilfe; das Backend ist die autoritative Quelle. Serverseitige Fehlermeldungen werden im Dialog angezeigt.

## Akzeptanzkriterien
### Name
- Das Feld `Name` ist ein Pflichtfeld.
- Ein leerer `Name` erzeugt die Fehlermeldung „Name ist erforderlich.".
- Der übergebene `Name` enthält keine führenden oder nachstehenden Leerzeichen.

### Spezies
- Das Feld `Spezies` ist ein Pflichtfeld.
- Ein nicht ausgewählter `Spezies`-Wert erzeugt die Fehlermeldung „Spezies ist erforderlich.".

### Person
- Das Feld `Person` ist ein optionales Feld.

### Server
- `Name` und `Species` werden client- und serverseitig validiert.
- Bei einem serverseitigen Validierungsfehler zeigt der Dialog die Fehlermeldung des Backends an.
