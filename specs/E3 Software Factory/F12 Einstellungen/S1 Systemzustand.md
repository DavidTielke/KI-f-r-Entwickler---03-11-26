# Systemzustand

## Meta
- **State:** Implemented

## User Story
Als Fachbereich möchte ich prüfen, ob alle Voraussetzungen der Software Factory erfüllt sind, damit ich die Ursache einer Störung schnell erkenne.

## Description
Die Seite „Einstellungen“ zeigt oben den Zustand von KI-Anbindung, Betriebsumgebung, Versionsverwaltung und Anwendung. Die Prüfungen führt der Factory-Dienst auf diesem Rechner aus.

## Akzeptanzkriterien
### Seite
- Die Seite ist unter `#/einstellungen` erreichbar.
- Die Seite zeigt die Dachzeile „System“.
- Die Seite zeigt den Titel „Einstellungen.“.

### Prüfungen
- Die Karte zeigt die Dachzeile „Betrieb“.
- Die Karte zeigt den Titel „Systemzustand.“.
- Solange kein Ergebnis vorliegt, steht dort „Wird geprüft …“.
- Jede Prüfung zeigt ihre Bezeichnung.
- Jede Prüfung zeigt eine Punkt-Markierung für bestanden oder nicht bestanden.
- Jede Prüfung zeigt eine Angabe zum Ergebnis.
- Die Prüfung „KI-Anbindung“ führt `claude --version` aus.
- Die Prüfung „KI-Anbindung“ zeigt bei Erfolg die ausgegebene Version.
- Die Prüfung „KI-Anbindung“ zeigt bei Misserfolg „Nicht installiert“.
- Die Prüfung „Betriebsumgebung“ führt `docker info` aus.
- Die Prüfung „Betriebsumgebung“ zeigt bei Erfolg „Docker {Version}“.
- Die Prüfung „Betriebsumgebung“ zeigt bei Misserfolg „Docker Desktop ist nicht gestartet“.
- Die Prüfung „Versionsverwaltung“ führt `git --version` aus.
- Die Prüfung „Versionsverwaltung“ zeigt die Ausgabe des Befehls.
- Die Prüfung „Anwendung“ fragt `appUrl` ab.
- Die Prüfung „Anwendung“ zeigt bei Erfolg `appUrl`.
- Die Prüfung „Anwendung“ zeigt bei Misserfolg „Nicht erreichbar“.
- Ein Befehl gilt nach 15 Sekunden ohne Ende als nicht bestanden.
- Die Anfrage an `appUrl` gilt nach 3 Sekunden ohne Antwort als nicht bestanden.
