# Vorlesen

## Meta
- **State:** Implemented

## User Story
Als Fachbereich möchte ich mir einzelne Antworten der KI vorlesen lassen, damit ich sie auch ohne Blick auf den Bildschirm aufnehmen kann.

## Description
An jeder Antwort der KI steht eine Lautsprecher-Schaltfläche. Die Ausgabe läuft über den im Browser eingebauten Dienst und auch ohne Gesprächsmodus.

## Akzeptanzkriterien
- Jede Nachricht der KI zeigt die Schaltfläche „Vorlesen“.
- Die Schaltfläche ist nur sichtbar, wenn der Browser Sprachausgabe unterstützt.
- Nachrichten des Anwenders zeigen die Schaltfläche nicht.
- Ein Klick liest den Text der Nachricht vor.
- Der Start einer Ausgabe beendet eine laufende Ausgabe.
- Die Oberfläche entfernt Backticks, Sterne, Unterstriche und Rauten vor dem Vorlesen.
- Die Oberfläche liest den Text Satz für Satz vor.
- Die Ausgabe arbeitet mit der Sprache `de-DE`.
- Die Ausgabe verwendet die Stimme und das Sprechtempo aus den Einstellungen (siehe S6).
- Scheitert die Ausgabe eines Satzes, fährt die Oberfläche mit dem nächsten Satz fort.
- Beim Verlassen des Gesprächs endet die Ausgabe.
