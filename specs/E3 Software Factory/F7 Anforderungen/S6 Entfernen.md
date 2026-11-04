# Entfernen

## Meta
- **State:** Implemented

## User Story
Als Fachbereich möchte ich eine noch nicht umgesetzte Anforderung entfernen, damit nur noch gewünschte Anforderungen in der Liste stehen.

## Description
Offene Anforderungen lassen sich auf der Detailseite entfernen. Anforderungen, die schon einmal umgesetzt waren, bleiben als Nachweis erhalten. Der Vorgang bleibt in der Versionsverwaltung nachvollziehbar.

## Akzeptanzkriterien
- Der Button „Anforderung entfernen“ ist nur bei einer offenen Anforderung sichtbar.
- Der Button „Anforderung entfernen“ ist bei einem Werkzeug-Themenbereich nicht sichtbar.
- Der Button „Anforderung entfernen“ ist deaktiviert, solange ein Auftrag läuft.
- Ein Klick öffnet einen Bestätigungsdialog mit dem Titel „Anforderung entfernen.“.
- Der Bestätigungsdialog zeigt „»{Titel}« wird entfernt. In der Versionsverwaltung bleibt der Vorgang nachvollziehbar. Umgesetzte Anforderungen lassen sich nicht entfernen.“.
- Der Bestätigungsdialog enthält den Button „Abbrechen“.
- Der Bestätigungsdialog enthält den Button „Entfernen“.
- Das Backend prüft, ob die Datei jemals mit dem Status `Implemented` eingecheckt war.
- War die Datei schon einmal `Implemented`, antwortet das Backend mit `409` und „Bereits umgesetzte Anforderungen bleiben als Nachweis erhalten und lassen sich nicht löschen.“.
- Bei einem Werkzeug-Themenbereich antwortet das Backend mit derselben Meldung.
- Das UI zeigt die Fehlermeldung des Backends im Bestätigungsdialog an.
- Das Backend entfernt die Datei.
- Das Backend entfernt den Ordner der Funktion, wenn er danach leer ist.
- Das Entfernen erzeugt die Git-Version `anforderung: {id} {Titel} entfernt`.
- Beim Entfernen wird das Event `requirement` mit dem Titel „Anforderung {id} »{Titel}« entfernt“ und ohne `ref` ausgelöst.
- Das UI entfernt die Anforderung aus der aktuellen Auswahl für die Umsetzung.
- Das UI wechselt nach dem Entfernen zu `#/anforderungen`.
