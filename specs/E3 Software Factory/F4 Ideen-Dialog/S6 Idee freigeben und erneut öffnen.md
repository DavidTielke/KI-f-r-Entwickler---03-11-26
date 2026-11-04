# Idee freigeben und erneut öffnen

## Meta
- **State:** Implemented

## User Story
Als Fachbereich möchte ich eine geklärte Idee ausdrücklich freigeben und bei Bedarf wieder öffnen, damit nur von mir bestätigte Ideen zu Anforderungen werden.

## Description
Die Freigabe erteilt nur der Fachbereich. Sie ist möglich, sobald alle übrigen Punkte der Definition of Ready erfüllt sind. Eine freigegebene Idee lässt sich erneut öffnen, solange sie nicht überführt ist.

## Akzeptanzkriterien
### Freigeben
- Der Button „Idee freigeben“ ist nur bei einer Idee im Status `Draft` sichtbar.
- Der Button „Idee freigeben“ ist deaktiviert, solange ein Punkt des Reifegrads außer der Bestätigung fehlt.
- Der Button „Idee freigeben“ ist deaktiviert, solange die KI arbeitet.
- Der deaktivierte Button zeigt den Hinweis „Die Definition of Ready ist noch nicht erfüllt.“.
- Ein Klick auf „Idee freigeben“ öffnet einen Bestätigungsdialog mit dem Titel „Idee freigeben.“.
- Der Bestätigungsdialog zeigt „Sie bestätigen die aktuelle Fassung von »{Titel}« als final. Danach lässt sich daraus eine Liste von Anforderungen erstellen.“.
- Der Bestätigungsdialog enthält den Button „Abbrechen“.
- Der Bestätigungsdialog enthält den Button „Idee freigeben“.
- Das Backend prüft die Punkte der Definition of Ready.
- Fehlt ein Punkt, antwortet das Backend mit `409` und „Die Idee ist noch nicht bereit: {fehlende Punkte}.“.
- Das UI zeigt die Fehlermeldung des Backends im Bestätigungsdialog an.
- Die Freigabe persistiert den Status `Ready`.
- Die Freigabe ergänzt die Entscheidung „{Datum}: Der Stakeholder hat die finale Fassung bestätigt.“.
- Die Freigabe erzeugt die Git-Version `idee: {id} {Titel} freigegeben`.
- Bei der Freigabe wird das Event `idea` mit dem Titel „Idee {id} »{Titel}« freigegeben“ ausgelöst.

### Freigegebene Idee
- Bei einer Idee im Status `Ready` ist das Gespräch schreibgeschützt.
- Das schreibgeschützte Gespräch zeigt „Diese Idee ist freigegeben. Öffnen Sie sie erneut, um das Gespräch fortzusetzen.“.
- Bei einer Idee im Status `Ready` ist der Button „Erneut öffnen“ sichtbar.
- Bei einer Idee im Status `Ready` ist der Button „Anforderungen erstellen“ sichtbar (siehe F6 S1).

### Erneut öffnen
- „Erneut öffnen“ wirkt ohne Bestätigungsdialog.
- Das Backend setzt den Status auf `Draft`.
- Die zuvor ergänzte Entscheidung zur Freigabe bleibt im Dokument erhalten.
- Das erneute Öffnen erzeugt keine Git-Version.
- Beim erneuten Öffnen wird das Event `idea` mit dem Titel „Idee {id} »{Titel}« erneut geöffnet“ ausgelöst.
- Das Backend antwortet außerhalb des Status `Ready` mit `409` und „Nur freigegebene Ideen lassen sich erneut öffnen.“.
- Das Backend antwortet während einer laufenden Überführung der Idee mit `409` und „Diese Idee wird gerade in Anforderungen überführt.“.
- Das UI zeigt die Fehlermeldung im Seitenbereich an.
