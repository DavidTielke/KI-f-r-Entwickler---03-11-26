# Anforderungen aus Idee erstellen

## Meta
- **State:** Implemented

## User Story
Als Fachbereich möchte ich eine freigegebene Idee von der KI in einzelne, prüfbare Anforderungen ausformulieren lassen, damit ich sie nicht selbst schreiben muss und danach gezielt umsetzen lassen kann.

## Description
Aus einer freigegebenen Idee startet der Fachbereich einen Überführungs-Auftrag. Die KI schreibt die Anforderungen nach dem verbindlichen Regelwerk. Umgesetzt wird dabei noch nichts. Der Auftrag läuft in der Warteschlange der Fertigung (siehe F10 S2).

## Akzeptanzkriterien
### Beauftragung
- Der Button „Anforderungen erstellen“ ist nur bei einer Idee im Status `Ready` sichtbar.
- Ein Klick auf „Anforderungen erstellen“ öffnet einen Bestätigungsdialog mit dem Titel „Anforderungen erstellen.“.
- Der Bestätigungsdialog zeigt „Die KI formuliert »{Titel}« in einzelne, prüfbare Anforderungen aus. Das Ergebnis können Sie anschließend prüfen und ergänzen. Umgesetzt wird noch nichts.“.
- Der Bestätigungsdialog enthält den Button „Abbrechen“.
- Der Bestätigungsdialog enthält den Button „Anforderungen erstellen“.
- Das Backend antwortet mit `202` und der Kennung des neuen Auftrags.
- Der neue Auftrag hat den Typ `transfer`.
- Der neue Auftrag trägt den Titel der Idee.
- Das UI wechselt nach der Bestätigung zu `#/umsetzung/{id}`.
- Bei der Beauftragung wird das Event `run` mit dem Titel „Überführung {id} für Idee {Idee} »{Titel}« beauftragt“ ausgelöst.
- Das Backend antwortet außerhalb des Status `Ready` mit `409` und „Nur freigegebene Ideen lassen sich in Anforderungen überführen.“.
- Das Backend antwortet bei einem wartenden oder laufenden Überführungs-Auftrag derselben Idee mit `409` und „Diese Idee wird bereits überführt.“.
- Das UI zeigt die Fehlermeldung des Backends im Bestätigungsdialog an.

### Phasen
- Der Auftrag durchläuft die Phasen „Vorbereitung“, „Ausformulierung“, „Formprüfung“ und „Sicherung“.

### Ausformulierung
- Die KI arbeitet in dieser Phase mit dem Rechteprofil `specs`.
- Die KI arbeitet mit dem Modell aus `buildModel`.
- Die KI arbeitet mit der Arbeitstiefe `high`.
- Die Phase endet spätestens nach 30 Minuten.
- Die KI erhält das Regelwerk aus `harness/_requirements.md`.
- Die KI erhält den Bestand der Anforderungen.
- Die KI erhält den Pfad der Ideen-Datei.
- Die KI erhält die Vorgabe, jede neue Anforderung mit dem Status `Modified` anzulegen.
- Die KI erhält die Vorgabe, geänderte bestehende Anforderungen auf den Status `Modified` zu setzen.
- Die KI erhält die Vorgabe, die Unterlagen `_Datenstruktur.md`, `_Menüstruktur.md` und `_Backend.md` aktuell zu halten.
- Die KI meldet in `summary` höchstens drei Sätze in Fachsprache.
- Die KI erhält die Vorgabe, in `summary` „offen“ statt `Modified` zu schreiben und keine Unterlagen zu nennen.
- Die KI erhält die Vorgabe, in `summary` Festlegungen zu nennen, die über die Idee hinausgehen.
