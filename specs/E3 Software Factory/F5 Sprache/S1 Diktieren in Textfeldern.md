# Diktieren in Textfeldern

## Meta
- **State:** Implemented

## User Story
Als Fachbereich möchte ich Textfelder per Stimme füllen, damit ich längere Angaben schneller und ohne Tippen erfassen kann.

## Description
Neben den Textfeldern steht eine Mikrofon-Schaltfläche. Der erkannte Text wird an den vorhandenen Inhalt angehängt. Die Erkennung läuft über den im Browser eingebauten Dienst.

## Akzeptanzkriterien
### Verfügbarkeit
- Die Mikrofon-Schaltfläche ist nur sichtbar, wenn der Browser Spracherkennung unterstützt.
- Die Mikrofon-Schaltfläche steht am Eingabefeld des Gesprächs.
- Die Mikrofon-Schaltfläche steht am Feld „Eigene Antwort oder Ergänzung“ der Rückfragen.
- Die Mikrofon-Schaltfläche steht an jedem Feld des Dialogs „Idee bearbeiten.“.
- Die Mikrofon-Schaltfläche steht an den Feldern „Titel“, „Nutzen“ und „Beschreibung“ des Anforderungs-Formulars.
- Die Mikrofon-Schaltfläche steht an jedem Abnahmekriterium des Anforderungs-Formulars.

### Bedienung
- Die Schaltfläche trägt die Bezeichnung „Diktieren“.
- Während der Aufnahme trägt die Schaltfläche die Bezeichnung „Diktat beenden“.
- Ein Klick während der Aufnahme beendet die Aufnahme.
- Die Spracherkennung arbeitet mit der Sprache `de-DE`.
- Der erkannte Text wird an den vorhandenen Inhalt des Feldes angehängt.
- Das vorläufige Ergebnis der Erkennung ist während der Aufnahme neben der Schaltfläche sichtbar.
- Beendet der Browser die Erkennung nach einer Pause von selbst, startet sie neu, solange die Aufnahme nicht beendet wurde.

### Ein Mikrofon
- Es ist immer nur ein Mikrofon aktiv.
- Der Start einer Aufnahme beendet eine andere laufende Aufnahme.
- Der Start einer Aufnahme beendet eine laufende Sprachausgabe.

### Fehler
- Verweigert der Browser den Zugriff, zeigt das UI „Der Browser hat den Zugriff auf das Mikrofon nicht erlaubt.“.
- Fehlt ein Mikrofon, zeigt das UI „Es wurde kein Mikrofon gefunden.“.
- Ist der Erkennungsdienst nicht erreichbar, zeigt das UI „Die Spracherkennung des Browsers ist nicht erreichbar.“.
- Fehlt die deutsche Erkennung, zeigt das UI „Der Browser unterstützt die Spracherkennung auf Deutsch nicht.“.
- Bei jedem anderen Fehler zeigt das UI „Die Spracherkennung ist fehlgeschlagen.“.
- Eine Pause ohne Sprache löst keine Fehlermeldung aus.
