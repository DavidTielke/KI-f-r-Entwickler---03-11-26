# Abbrechen und Verwerfen

## Meta
- **State:** Implemented

## User Story
Als Fachbereich möchte ich einen Auftrag abbrechen und seine nicht gesicherten Änderungen verwerfen können, damit ich bei einer Fehlentwicklung sauber neu ansetzen kann.

## Description
Wartende und laufende Aufträge lassen sich abbrechen. Bleiben danach nicht gesicherte Änderungen zurück, entscheidet der Fachbereich, ob sie verworfen werden. Bis dahin ist ein neuer Lauf desselben Auftrags gesperrt.

## Akzeptanzkriterien
### Abbrechen
- Der Button „Auftrag abbrechen“ ist bei den Status `queued` und `running` sichtbar.
- Ein Klick öffnet einen Bestätigungsdialog mit dem Titel „Auftrag abbrechen.“.
- Der Bestätigungsdialog zeigt „Die Arbeit wird sofort beendet. Bereits vorgenommene Änderungen bleiben zunächst erhalten, und Sie entscheiden anschließend, ob sie verworfen werden.“.
- Der Bestätigungsdialog enthält den Button „Abbrechen“.
- Der Bestätigungsdialog enthält den Button „Auftrag abbrechen“.
- Ein wartender Auftrag verlässt die Warteschlange und erhält den Status `canceled`.
- Beim Abbruch eines wartenden Auftrags wird kein Event ausgelöst.
- Bei einem laufenden Auftrag beendet das Backend die KI und den laufenden Befehl samt Unterprozessen.
- Ein abgebrochener laufender Auftrag erhält den Status `canceled`.
- Der Auftrag zeigt danach „Der Auftrag wurde abgebrochen.“.
- Beim Abbruch eines laufenden Auftrags wird das Event `run` mit dem Titel „{Auftrag} abgebrochen“ ausgelöst.
- Das Backend antwortet bei einem nicht mehr laufenden Auftrag mit `409` und „Dieser Auftrag läuft nicht mehr.“.

### Scheitern
- Ein gescheiterter Auftrag erhält den Status `failed`.
- Die aktive Phase eines gescheiterten oder abgebrochenen Auftrags ist als gescheitert markiert.
- Beim Scheitern wird das Event `run` mit dem Titel „{Auftrag} fehlgeschlagen“ ausgelöst.
- Liegen nach dem Scheitern oder Abbruch einer Überführung oder Umsetzung nicht gesicherte Änderungen vor und hat der Auftrag die Vorbereitung bestanden, setzt das Backend `canDiscard` auf wahr.
- Scheitert ein Auftrag in der Vorbereitung, setzt das Backend `canDiscard` nicht.
- Bei einer Rücknahme setzt das Backend `canDiscard` nicht.
- Nach einem Neustart des Dienstes setzt das Backend `canDiscard` bei unterbrochenen Überführungen und Umsetzungen auf wahr, die die Vorbereitung bestanden haben.

### Verwerfen
- Der Button „Änderungen verwerfen“ ist nur bei `canDiscard` sichtbar.
- Bei `canDiscard` ergänzt die Fehlermeldung „Die bisherigen Änderungen liegen noch im Arbeitsstand. Sie können sie verwerfen und den Auftrag danach erneut starten.“.
- Ein Klick öffnet einen Bestätigungsdialog mit dem Titel „Änderungen verwerfen.“.
- Der Bestätigungsdialog zeigt „Alle nicht gesicherten Änderungen an der Anwendung und den Anforderungen werden entfernt. Diese Aktion kann nicht rückgängig gemacht werden.“.
- Der Bestätigungsdialog enthält den Button „Abbrechen“.
- Der Bestätigungsdialog enthält den Button „Verwerfen“.
- Bei einer Umsetzung stellt das Backend `code` außerhalb von `code/factory`, `specs` und `docker-compose.yml` auf den Stand der letzten Git-Version zurück.
- Bei einer Überführung stellt das Backend nur `specs` auf den Stand der letzten Git-Version zurück.
- Das Backend entfernt dort nicht versionierte Dateien.
- Das Backend setzt `canDiscard` auf falsch.
- Beim Verwerfen wird das Event `run` mit dem Titel „Änderungen aus {id} verworfen“ ausgelöst.
- Das Backend antwortet ohne `canDiscard` mit `409` und „Zu diesem Auftrag gibt es keine verwerfbaren Änderungen.“.
- Das Backend antwortet während eines laufenden Auftrags mit `409` und „Bitte warten Sie, bis der laufende Auftrag abgeschlossen ist.“.
