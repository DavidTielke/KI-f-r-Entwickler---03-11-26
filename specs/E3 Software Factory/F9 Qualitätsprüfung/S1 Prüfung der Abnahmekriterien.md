# Prüfung der Abnahmekriterien

## Meta
- **State:** Implemented

## User Story
Als Fachbereich möchte ich die Abnahmekriterien einer Anforderung von der KI prüfen lassen, damit sie eindeutig, prüfbar und atomar sind, bevor sie umgesetzt werden.

## Description
Die Qualitätsprüfung bewertet jedes Abnahmekriterium gegen die INVEST-Prinzipien und das Regelwerk. Sie ist im Formular, auf der Detailseite und im Entwurf erreichbar und verändert selbst nichts.

## Akzeptanzkriterien
### Aufruf
- Der Button „Qualität prüfen“ steht im Anforderungs-Formular.
- Der Button „Qualität prüfen“ steht auf der Detailseite in der Karte „Abnahmekriterien.“.
- Der Button „Qualität prüfen“ steht im Entwurf des Assistenten.
- Auf der Detailseite einer Anforderung aus einem Werkzeug-Themenbereich ist der Button nicht sichtbar.
- Im Entwurf ist der Button unter denselben Bedingungen zu Titel, Nutzen, Kriterien und KI-Arbeit deaktiviert wie „Anforderung anlegen“ (siehe F8 S3).
- Während der Prüfung heißt der Button „Prüfung läuft …“.
- Während der Prüfung ist der Button deaktiviert.
- Eine neue Prüfung entfernt das vorherige Ergebnis.

### Backend
- Das Backend validiert die Eingaben vor der Prüfung wie beim Anlegen (siehe F7 S4).
- Das Backend wartet mit seiner Antwort auf das Ergebnis der KI.
- Die KI arbeitet mit dem Rechteprofil `read`.
- Die KI arbeitet mit dem Modell aus `dialogModel`.
- Die KI erhält das Regelwerk aus `harness/_requirements.md`.
- Das Ergebnis enthält `verdict` mit dem Wert `gut` oder `nachbessern`.
- Das Ergebnis enthält `summary` mit höchstens zwei Sätzen.
- Das Ergebnis enthält `findings` nur für Kriterien mit echten Mängeln.
- Die Prüfung persistiert nichts.
- Das UI zeigt einen Fehler der Prüfung als Fehlermeldung an.

### Ergebnis
- Das UI zeigt `summary` als Hinweis.
- Bei `gut` trägt der Hinweis ein Häkchen.
- Bei `nachbessern` trägt der Hinweis ein Warnzeichen.
- Ein Befund zeigt das INVEST-Prinzip aus `principle` als Marke.
- Das Feld `principle` hat einen der Werte `Unabhängig`, `Verhandelbar`, `Wertvoll`, `Schätzbar`, `Klein` oder `Testbar`.
- Ein Befund zeigt das geprüfte Kriterium aus `criterion`.
- Ein Befund zeigt den Mangel aus `problem`.
- Ein Befund zeigt unter der Bezeichnung „Vorschlag“ die Formulierungen aus `suggestions`.
- Text in Backticks erscheint im Ergebnis als Code-Auszeichnung.
- Text zwischen doppelten Sternen erscheint im Ergebnis fett.
