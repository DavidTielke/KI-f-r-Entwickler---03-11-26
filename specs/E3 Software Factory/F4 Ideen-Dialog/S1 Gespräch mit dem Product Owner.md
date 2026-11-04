# Gespräch mit dem Product Owner

## Meta
- **State:** Implemented

## User Story
Als Fachbereich möchte ich meine Idee im Gespräch mit einem kritischen Product Owner schärfen, damit daraus eine vollständig geklärte Idee entsteht, bevor Anforderungen geschrieben werden.

## Description
Der Ideen-Dialog zeigt links das Gespräch und rechts den Reifegrad sowie den Stand der Idee. Der Product Owner ist eine KI, die nach dem Regelwerk für Ideen arbeitet und den Bestand prüft. Sie liest dabei ausschließlich. Das Ideen-Dokument schreibt der Factory-Dienst nach jeder Runde aus ihrer Antwort fort.

## Akzeptanzkriterien
### Kopfbereich
- Die Seite ist unter `#/ideen/{id}` erreichbar.
- Die Seite zeigt die Dachzeile „Idee {id}“.
- Die Seite zeigt den Titel der Idee.
- Die Schaltfläche „Zurück“ führt zu `#/ideen`.
- Der Status `Draft` erscheint als Marke „In Klärung“.
- Der Status `Ready` erscheint als Marke „Freigegeben“.
- Der Status `Übernommen` erscheint als Marke „Überführt“.
- Bei einer unbekannten Kennung zeigt das UI „Diese Idee existiert nicht mehr.“.

### Gesprächsverlauf
- Der Bereich zeigt die Dachzeile „Dialog“.
- Der Bereich zeigt den Titel „Product Owner.“.
- Beiträge des Anwenders tragen die Bezeichnung „Sie“.
- Beiträge der KI tragen die Bezeichnung „Product Owner“.
- Jeder Beitrag zeigt die Uhrzeit im Format `HH:MM:SS`.
- Der Verlauf rollt bei einem neuen Beitrag ans Ende.
- Ohne Beiträge steht dort „Noch kein Gesprächsverlauf.“.

### Antworten
- Das Eingabefeld zeigt den Platzhalter „Antworten Sie dem Product Owner oder ergänzen Sie etwas“.
- Die Enter-Taste sendet die Eingabe.
- Die Tastenkombination Umschalt und Enter fügt einen Zeilenumbruch ein.
- Der Button „Senden“ ist bei leerer Eingabe deaktiviert.
- Das Eingabefeld ist deaktiviert, solange die KI arbeitet.
- Das Backend nimmt die Antwort mit `202` an und führt die KI-Runde im Hintergrund aus.
- Das Backend antwortet bei leerem Text mit `400` und „Bitte geben Sie eine Antwort ein.“.
- Solange die KI arbeitet, steht im Verlauf „Product Owner arbeitet“.
- Solange die KI arbeitet, zeigt der Verlauf ihre letzten 4 Arbeitsschritte.

### KI-Runde
- Die KI erhält das Regelwerk aus `harness/_ideas.md`, den Bestand der Anforderungen, das Ideen-Dokument und den Gesprächsverlauf.
- Die KI arbeitet mit dem Rechteprofil `read`.
- Die KI arbeitet mit dem Modell aus `dialogModel`.
- Die KI liefert eine Nachricht (`message`), die Phase (`phase`), Rückfragen (`questions`), das Dokument (`document`) und den Reifegrad (`readiness`).
- Das Backend persistiert das Dokument nach jeder Runde in der Ideen-Datei.
- Das Backend übernimmt die Felder `problem`, `solution`, `inScope`, `outOfScope`, `impactSpecs`, `impactData`, `impactBackend` und `impactCode` aus der Antwort der KI.
- Das Backend übernimmt den Titel aus der Antwort der KI nur, wenn er nicht leer ist.
- Das Backend ersetzt die offenen Punkte durch die Liste aus `openPoints`.
- Das Backend hängt neue Entscheidungen aus `newDecisions` im Format `{Datum}: {Entscheidung}` an.

### Fehler
- Endet eine Runde mit einem Fehler, zeigt der Verlauf die Fehlermeldung.
- Unter der Fehlermeldung ist der Button „Erneut versuchen“ sichtbar.
- „Erneut versuchen“ wiederholt die Runde, ohne eine neue Nachricht anzulegen.
- Das Backend beendet eine Runde nach 5 Minuten mit „Die KI hat die Zeitvorgabe überschritten.“.
- Eine Antwort ohne auswertbares Ergebnis endet mit „Die KI hat keine auswertbare Antwort geliefert.“.
- Ist die KI nicht angemeldet, lautet die Meldung „Die KI ist nicht angemeldet. Bitte starten Sie einmal „claude“ in einem Terminal und melden Sie sich an.“.
- Ist das Kontingent erschöpft, lautet die Meldung „Das KI-Kontingent ist derzeit ausgeschöpft oder überlastet. Bitte versuchen Sie es später erneut.“.
- Ist die KI-Anbindung nicht installiert, lautet die Meldung „Die KI-Anbindung „claude“ ist auf diesem Rechner nicht installiert.“.
- Bei jedem anderen KI-Fehler lautet die Meldung „Die KI konnte den Auftrag nicht abschließen.“.
