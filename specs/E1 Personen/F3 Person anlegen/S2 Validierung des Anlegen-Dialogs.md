# Validierung des Anlegen-Dialogs

## Meta
- **State:** Implemented

## User Story
Als Administration möchte ich ungültige Eingaben vor dem Absenden erkennen, damit ich keine fehlerhaften Personen anlegen kann.

## Description
Der Anlegen-Dialog validiert die Felder clientseitig als UX-Hilfe; das Backend ist die autoritative Quelle. Serverseitige Fehlermeldungen werden im Dialog angezeigt.

## Akzeptanzkriterien
### Name
- Das Feld `Name` ist ein Pflichtfeld.
- Ein leerer `Name` erzeugt die Fehlermeldung „Name ist erforderlich.".
- Der übertragene `Name` enthält keine führenden oder nachstehenden Leerzeichen.

### Alter
- Das Feld `Alter` ist ein Pflichtfeld.
- Ein nicht-zahlengleiches `Alter` erzeugt die Fehlermeldung „Alter muss eine Zahl sein.".
- Ein `Alter` außerhalb des Bereichs 0 bis 150 erzeugt die Fehlermeldung „Alter muss zwischen 0 und 150 liegen.".

### Server
- `Name` und `Alter` werden client- und serverseitig validiert.
- Bei einem serverseitigen Validierungsfehler zeigt der Dialog die Fehlermeldung des Backends an.
