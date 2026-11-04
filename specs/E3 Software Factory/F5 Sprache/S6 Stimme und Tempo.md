# Stimme und Tempo

## Meta
- **State:** Implemented

## User Story
Als Fachbereich möchte ich, dass die Anwendung eine angenehme deutsche Stimme in passendem Tempo verwendet, damit ich ihr gut zuhören kann.

## Description
Die Anwendung wählt automatisch die natürlichste verfügbare deutsche Stimme. Stimme und Tempo lassen sich in den Einstellungen ändern (siehe F12 S3) und gelten je Browser.

## Akzeptanzkriterien
### Stimmen
- Zur Auswahl stehen nur Stimmen, deren Sprache mit `de` beginnt.
- Stimmen mit „natural“ im Namen stehen an erster Stelle.
- Stimmen mit „online“ im Namen folgen an zweiter Stelle.
- Stimmen mit „google“ im Namen folgen an dritter Stelle.
- Alle übrigen deutschen Stimmen folgen danach.
- Ohne gewählte Stimme verwendet die Oberfläche die erste Stimme dieser Rangfolge.
- Ist die gewählte Stimme nicht mehr vorhanden, verwendet die Oberfläche die erste Stimme dieser Rangfolge.

### Tempo
- Das Sprechtempo beträgt ohne eigene Wahl `1.05`.

### Speicherung
- Die Oberfläche speichert Stimme und Tempo unter `software-factory.voice` im lokalen Speicher des Browsers.
- Der gespeicherte Eintrag enthält die Felder `voiceName` und `rate`.
- Das Backend kennt diese Einstellungen nicht.
- Ist kein lokaler Speicher verfügbar, arbeitet die Ausgabe mit der automatisch gewählten Stimme und dem Tempo `1.05`.
- Eine geänderte Stimme gilt ab der nächsten Ausgabe.
