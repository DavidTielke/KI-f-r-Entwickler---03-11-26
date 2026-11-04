# Arbeitsprotokoll

## Meta
- **State:** Implemented

## User Story
Als Fachbereich möchte ich in verständlicher Sprache verfolgen, was die KI gerade tut, damit die Arbeit nachvollziehbar bleibt, auch ohne IT-Kenntnisse.

## Description
Das Arbeitsprotokoll zeigt jeden Arbeitsschritt eines Auftrags in Fachsprache. Technische Details lassen sich bei Bedarf einblenden. Das Protokoll wächst während des Laufs live.

## Akzeptanzkriterien
### Darstellung
- Die Karte zeigt die Dachzeile „Nachvollziehbarkeit“.
- Die Karte zeigt den Titel „Arbeitsprotokoll.“.
- Ein Eintrag zeigt die Uhrzeit im Format `HH:MM:SS`.
- Ein Eintrag zeigt den Text des Arbeitsschritts.
- Der Button „Technische Details einblenden“ zeigt zu jedem Eintrag sein Feld `detail`.
- Sind die Details eingeblendet, heißt der Button „Technische Details ausblenden“.
- Während des Laufs rollt das Protokoll bei einem neuen Eintrag ans Ende.
- Während des Laufs steht am Ende „Die Arbeit läuft“.
- Bei einem wartenden Auftrag ohne Einträge steht dort „Der Auftrag wartet auf seinen Start.“.
- Bei einem anderen Auftrag ohne Einträge steht dort „Noch keine Einträge.“.
- Das Backend bewahrt je Auftrag höchstens 1500 Einträge auf.
- Die Oberfläche erhält je Auftrag höchstens die letzten 600 Einträge.

### Eintragsarten
- Texte der KI erscheinen mit `kind` gleich `narration`.
- Arbeitsschritte erscheinen mit `kind` gleich `step`.
- Hinweise der Factory erscheinen mit `kind` gleich `hint`.
- Blockiert die Factory Aktionen der KI, erscheint „Die KI wollte {n} nicht freigegebene Aktionen ausführen. Sie wurden blockiert.“.

### Übersetzung in Fachsprache
- Das Lesen einer Datei erscheint als „Liest {Gegenstand}“.
- Das Ändern einer Datei erscheint als „Bearbeitet {Gegenstand}“.
- Das Suchen im Bestand erscheint als „Durchsucht den Bestand“.
- Eine Datei `_Datenstruktur.md` heißt „das Datenmodell“.
- Eine Datei `_Backend.md` heißt „die Schnittstellenbeschreibung“.
- Eine Datei `_Menüstruktur.md` heißt „die Menüstruktur“.
- Eine Datei `S{n} {Titel}.md` heißt „die Anforderung »{Titel}«“.
- Übrige Dateien unter `specs/` heißen „die Anforderungen“.
- Eine Datei `I{n} {Titel}.md` heißt „die Idee »{Titel}«“.
- Dateien unter `harness/` und die Datei `AGENTS.md` heißen „die Projektregeln“.
- Dateien unter `code/backend/Migrations` heißen „die Datenbankstruktur“.
- Dateien unter `code/backend/Models`, `code/backend/Configurations` und `code/backend/Data` heißen „das Datenmodell der Anwendung“.
- Übrige Dateien unter `code/backend` heißen „die Serverlogik“.
- Dateien unter `code/frontend` heißen „die Oberfläche“.
- Die Datei `docker-compose.yml` heißt „die Betriebsumgebung“.
- Alle anderen Dateien erscheinen als „den Bestand“.
- Ein Befehl mit `ef migrations` oder `ef database` erscheint als „Bereitet die Datenbankänderung vor“.
- Ein `dotnet`-Befehl mit `build` oder `test` erscheint als „Prüft die Serverlogik“.
- Ein `npm`-Befehl mit `build`, `lint` oder `test` erscheint als „Prüft die Oberfläche“.
- Ein `npm`-Befehl mit `ci` oder `install` erscheint als „Stellt benötigte Programmbausteine bereit“.
- Jeder andere Befehl erscheint als „Führt einen Prüfschritt aus“.
- Jedes andere Werkzeug erscheint als „Arbeitet am Auftrag“.
