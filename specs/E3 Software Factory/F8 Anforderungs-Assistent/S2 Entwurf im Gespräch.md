# Entwurf im Gespräch

## Meta
- **State:** Implemented

## User Story
Als Fachbereich möchte ich eine Anforderung im Gespräch mit dem Assistenten entstehen sehen, damit ich ohne Vorkenntnisse eine prüfbare Anforderung erhalte.

## Description
Links läuft das Gespräch, rechts wächst der Entwurf mit jeder Runde. Rückfragen und Sprachfunktionen arbeiten wie im Ideen-Dialog (siehe F4 S2 und F5 S3). Offene Entwürfe lassen sich jederzeit fortsetzen.

## Akzeptanzkriterien
### Kopfbereich
- Die Seite ist unter `#/assistent/{id}` erreichbar.
- Die Seite zeigt die Dachzeile „Entwurf {id}“.
- Die Seite zeigt den Titel des Entwurfs.
- Ein Entwurf ohne Titel zeigt den Titel „Neue Anforderung.“.
- Die Schaltfläche „Zurück“ führt zu `#/anforderungen`.
- Der Kopfbereich zeigt den Reifegrad im Format `{n}/4`.
- Bei einer unbekannten Kennung zeigt das UI „Dieser Entwurf existiert nicht mehr.“.

### Gespräch
- Der Gesprächsbereich zeigt den Titel „Anforderungs-Assistent.“.
- Das Eingabefeld zeigt den Platzhalter „Antworten Sie dem Assistenten oder ergänzen Sie etwas“.
- Die KI erhält das Regelwerk aus `harness/_requirements.md`, den Bestand der Anforderungen, den Entwurf und den Gesprächsverlauf.
- Die KI arbeitet mit dem Rechteprofil `read`.
- Die KI arbeitet mit dem Modell aus `dialogModel`.
- Die KI liefert in jeder Runde den vollständigen Entwurf im Feld `draft`.
- Das Backend ersetzt den Entwurf durch das Ergebnis der Runde.
- Das Backend ersetzt `readiness` durch das Ergebnis der Runde.

### Stand der Anforderung
- Die Karte zeigt die Dachzeile „Entwurf“.
- Die Karte zeigt den Titel „Stand der Anforderung.“.
- Die Liste enthält „Rolle, Ziel und Nutzen sind klar“.
- Die Liste enthält „Das Verhalten ist vollständig abgedeckt“.
- Die Liste enthält „Jedes Kriterium ist eindeutig prüfbar“.
- Die Liste enthält „Die Einordnung steht fest“.
- Ein erfüllter Punkt zeigt ein Häkchen.
- Der Abschnitt „Einordnung“ zeigt den Namen des Themenbereichs und durch „ · “ getrennt den Namen der Funktion.
- Ohne Themenbereich zeigt der Abschnitt „Einordnung“ den Text „Noch offen“.
- Ein neuer Themenbereich trägt den Zusatz „(neuer Themenbereich)“.
- Eine neue Funktion in einem bestehenden Themenbereich trägt den Zusatz „(neue Funktion)“.
- Der Abschnitt „Nutzen“ zeigt das Feld `userStory`.
- Der Abschnitt „Beschreibung“ zeigt das Feld `description`.
- Ein leerer Abschnitt „Nutzen“ oder „Beschreibung“ zeigt „Noch offen“.
- Der Abschnitt der Kriterien trägt die Bezeichnung „{n} Abnahmekriterium“ beziehungsweise „{n} Abnahmekriterien“.
- Der Abschnitt der Kriterien zeigt die Kriterien nach ihren Themen gruppiert.

### Offene Entwürfe
- Die Seite „Anforderungen“ zeigt bei offenen Entwürfen die Karte „Entwürfe im Gespräch.“ mit der Dachzeile „KI-Assistent“.
- Ohne offenen Entwurf ist die Karte nicht sichtbar.
- Ein Eintrag zeigt die Kennung des Entwurfs.
- Ein Eintrag zeigt den Titel des Entwurfs oder „Neue Anforderung“.
- Ein Eintrag zeigt „Assistent arbeitet“, solange die KI arbeitet.
- Ein Eintrag zeigt „Wartet auf Sie“, wenn die letzte Nachricht von der KI stammt.
- Ein Eintrag zeigt in allen übrigen Fällen „Offen“.
- Ein Eintrag führt zu `#/assistent/{id}`.
