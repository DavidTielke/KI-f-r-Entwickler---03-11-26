# Prüfung und Sicherung

## Meta
- **State:** Implemented

## User Story
Als Fachbereich möchte ich, dass die Factory das Ergebnis der Überführung prüft und sichert, damit nur formal korrekte Anforderungen entstehen und die Herkunft nachvollziehbar bleibt.

## Description
Vor dem Start prüft die Factory, ob der Bereich der Anforderungen sauber ist. Danach prüft sie, was die KI geschrieben hat, schließt die Idee ab und sichert alles als Version. Bei einem Fehler endet der Auftrag, und die Idee bleibt freigegeben.

## Akzeptanzkriterien
### Vorbereitung
- Liegen unter `specs/` nicht gesicherte Änderungen, endet der Auftrag mit „Unter den Anforderungen liegen nicht gesicherte Änderungen. Bitte sichern oder verwerfen Sie diese zuerst.“.
- Das Backend merkt sich den Ausgangsstand im Feld `baseCommit`.

### Formprüfung
- Das Backend wertet alle geänderten und neuen Dateien unter `specs/` aus, die dem Format `specs/E{n} …/F{n} …/S{n} ….md` entsprechen.
- Ohne solche Datei endet der Auftrag mit „Die KI hat keine Anforderungen angelegt.“.
- Eine Anforderung ohne Titel erzeugt den Befund „Titel fehlt“.
- Eine Anforderung mit einem anderen Status als `Modified` oder `Implemented` erzeugt den Befund „Status ungültig“.
- Eine Anforderung ohne User Story erzeugt den Befund „Nutzen fehlt“.
- Eine Anforderung ohne Akzeptanzkriterien erzeugt den Befund „Abnahmekriterien fehlen“.
- Bei mindestens einem Befund endet der Auftrag mit „Einige Anforderungen entsprechen nicht dem vorgeschriebenen Format.“.
- Die Befunde stehen je Datei in den technischen Details des Auftrags.
- Sind seit dem Start der Überführung Änderungen außerhalb von `specs`, `ideas` und `code/factory` hinzugekommen, endet der Auftrag mit „Die KI hat Dateien außerhalb der Anforderungen verändert.“.
- Vor dem Start vorhandene Änderungen außerhalb dieser Bereiche lassen den Auftrag nicht scheitern.
- Die betroffenen Dateien stehen in den technischen Details des Auftrags.

### Sicherung
- Das Backend setzt den Status der Idee auf `Übernommen`.
- Das Backend ergänzt im Abschnitt `## Übergang zu Specs` der Idee die Zeile `{Datum}: Überführt in {Pfade}.`.
- Die Pfade stehen in dieser Zeile in Backticks und durch Komma getrennt.
- Das Backend erzeugt die Git-Version `idee: {id} {Titel} in anforderungen überführt`.
- Die Git-Version enthält die Änderungen unter `specs` und die Ideen-Datei.
- Der Text der Git-Version listet alle betroffenen Anforderungen auf.
- Das Backend übernimmt `summary` der KI in den Auftrag.
- Das Backend trägt die betroffenen Anforderungen im Feld `stories` des Auftrags ein.
- Bei erfolgreichem Abschluss wird das Event `run` mit dem Titel „Idee {id} »{Titel}« in {n} Anforderungen überführt“ ausgelöst.

### Ergebnis
- Der Auftrag zeigt nach erfolgreichem Abschluss den Button „Anforderungen prüfen“.
- „Anforderungen prüfen“ führt zu `#/anforderungen?filter=offen`.
- Eine Idee im Status `Übernommen` zeigt den Button „Anforderungen ansehen“.
- „Anforderungen ansehen“ führt zu `#/anforderungen`.
- Das Gespräch einer Idee im Status `Übernommen` zeigt „Diese Idee ist abgeschlossen und bleibt als Nachweis erhalten.“.
- Endet der Auftrag vor der Sicherung mit einem Fehler, bleibt die Idee im Status `Ready`.
