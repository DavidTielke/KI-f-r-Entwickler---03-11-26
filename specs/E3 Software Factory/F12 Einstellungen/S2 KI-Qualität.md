# KI-Qualität

## Meta
- **State:** Implemented

## User Story
Als Fachbereich möchte ich festlegen, welches KI-Modell für Gespräche und welches für die Umsetzung arbeitet, damit ich Antwortzeit und Gründlichkeit steuern kann.

## Description
Zwei Auswahlfelder bestimmen die KI für Gespräche und Prüfungen sowie für Ausformulierung und Umsetzung. Eine Änderung gilt ab dem nächsten Start der KI.

## Akzeptanzkriterien
- Die Karte zeigt die Dachzeile „Arbeitsweise“.
- Die Karte zeigt den Titel „KI-Qualität.“.
- Das Auswahlfeld „Gespräche und Prüfungen“ zeigt den Wert aus `dialogModel`.
- Das Auswahlfeld „Gespräche und Prüfungen“ zeigt den Hinweis „Ideen-Dialog, Anforderungs-Assistent und Qualitätsprüfung. Kurze Antwortzeiten sind hier wichtig.“.
- Das Auswahlfeld „Ausformulierung und Umsetzung“ zeigt den Wert aus `buildModel`.
- Das Auswahlfeld „Ausformulierung und Umsetzung“ zeigt den Hinweis „Erstellt Anforderungen aus Ideen und setzt sie um. Gründlichkeit ist hier wichtig.“.
- Beide Auswahlfelder bieten „Schnell (Haiku 5.5)“, „Ausgewogen (Sonnet 5.5)“, „Gründlich (Opus 5.5)“ und „Maximal (Fable 5.1)“.
- Der Wert von `dialogModel` ist ohne eigene Wahl `claude-sonnet-5-5`.
- Der Wert von `buildModel` ist ohne eigene Wahl `claude-opus-5-5`.
- Eine Änderung wird sofort ohne eigene Speichern-Schaltfläche persistiert.
- Das Backend persistiert die Auswahl in `code/factory/data/settings.json`.
- Das Backend antwortet bei einem unbekannten Modell mit `400` und „Unbekanntes KI-Modell.“.
- Das UI zeigt die Fehlermeldung des Backends auf der Seite an.
- Eine Änderung gilt ab dem nächsten Start der KI.
- Eine Änderung löst die Live-Meldung `settings` aus.
- Die Felder `appUrl` und `healthPaths` lassen sich in der Oberfläche nicht ändern.
