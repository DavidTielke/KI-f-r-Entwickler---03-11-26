# Sicherheitsgrenzen

## Meta
- **State:** Implemented

## User Story
Als Fachbereich möchte ich nachlesen, was die KI darf und was nicht, damit ich der Arbeit der Software Factory vertrauen kann.

## Description
Die Karte „Sicherheit“ nennt die Grenzen der KI in Fachsprache. Die technische Durchsetzung über Rechteprofile und Zugriffsschutz beschreibt `_Backend.md`.

## Akzeptanzkriterien
### Anzeige
- Die Karte zeigt die Dachzeile „Grenzen der KI“.
- Die Karte zeigt den Titel „Sicherheit.“.
- Die Karte nennt „Die Software Factory ist nur auf diesem Rechner erreichbar und hat keine Anmeldung.“.
- Die Karte nennt „In Gesprächen und Prüfungen darf die KI ausschließlich lesen.“.
- Die Karte nennt „Bei der Überführung einer Idee darf die KI ausschließlich Anforderungen schreiben.“.
- Die Karte nennt „Bei der Umsetzung darf die KI die Anwendung und ihre Anforderungen ändern, aber weder Versionen sichern noch ausliefern. Das übernimmt die Factory selbst und prüft vorher jede geänderte Datei.“.
- Die Karte nennt „Andere angebundene Systeme des Anwenders stehen der KI hier nicht zur Verfügung.“.

### Durchsetzung
- Das Backend startet die KI in Gesprächen und Prüfungen mit dem Rechteprofil `read`.
- Das Backend startet die KI bei der Überführung mit dem Rechteprofil `specs`.
- Das Backend startet die KI bei der Umsetzung und der Nachbesserung mit dem Rechteprofil `build`.
- Das Backend startet die KI ohne angebundene MCP-Server.
- Das Backend startet die KI ohne die globalen Einstellungen des Anwenders.
- Das Backend startet die KI mit deaktivierten Slash-Befehlen.
- Der Dienst nimmt Verbindungen nur auf `127.0.0.1` an.
- Das Backend weist Anfragen mit fremdem `Host` mit `403` und „Zugriff nur lokal erlaubt.“ ab.
- Das Backend weist Anfragen mit fremdem `Origin` mit `403` und „Zugriff nur lokal erlaubt.“ ab.
- Das Backend weist ändernde Anfragen ohne JSON-Inhalt mit `415` und „Ungültiges Anfrageformat.“ ab.
