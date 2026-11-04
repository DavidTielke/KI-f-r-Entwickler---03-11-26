# Einsprechen beim Einstieg

## Meta
- **State:** Implemented

## User Story
Als Fachbereich möchte ich mein Anliegen beim Einstieg in ein Gespräch einfach einsprechen, damit ich frei erzählen kann und das Gespräch direkt per Stimme weiterläuft.

## Description
Die Einstiegsdialoge „Idee erfassen“, „Anforderung entwickeln“ und „Mit dem Assistenten überarbeiten“ bieten oben eine große Aufnahme-Schaltfläche. Wer sie benutzt, führt das folgende Gespräch automatisch im Gesprächsmodus fort.

## Akzeptanzkriterien
### Aufnahme
- Die große Aufnahme-Schaltfläche ist nur sichtbar, wenn der Browser Spracherkennung unterstützt.
- Die Schaltfläche trägt die Bezeichnung „Aufnahme starten“.
- Während der Aufnahme trägt die Schaltfläche die Bezeichnung „Aufnahme beenden“.
- Ohne Aufnahme steht neben der Schaltfläche „Einsprechen“.
- Ohne Aufnahme steht darunter „Erzählen Sie in eigenen Worten. Das Gespräch läuft danach ebenfalls per Stimme weiter.“.
- Während der Aufnahme steht neben der Schaltfläche „Ich höre Ihnen zu“.
- Während der Aufnahme steht darunter das vorläufige Ergebnis der Erkennung.
- Ohne vorläufiges Ergebnis steht darunter „Sprechen Sie frei. Der Text erscheint unten im Feld.“.
- Der erkannte Text wird an den Inhalt des Textfelds angehängt.
- Der Inhalt des Textfelds lässt sich jederzeit von Hand ändern.
- Das Textfeld erhält den Fokus nur, wenn der Browser keine Spracherkennung unterstützt.

### Übergang ins Gespräch
- Das Absenden beendet eine laufende Aufnahme.
- Wurde die Aufnahme im Dialog benutzt, startet das Gespräch danach im Gesprächsmodus (siehe S3).
- Wurde die Aufnahme nicht benutzt, startet das Gespräch ohne Gesprächsmodus.
- Die Übergabe erfolgt über den Sitzungsspeicher des Browsers unter `software-factory.voice-mode`.
- Die Oberfläche entfernt die Übergabe beim Öffnen des Gesprächs.
- Beim Neuladen des Gesprächs bleibt das Mikrofon aus.
