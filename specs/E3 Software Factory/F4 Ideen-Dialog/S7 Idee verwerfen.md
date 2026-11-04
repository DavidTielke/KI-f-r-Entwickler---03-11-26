# Idee verwerfen

## Meta
- **State:** Implemented

## User Story
Als Fachbereich möchte ich eine Idee verwerfen, die ich nicht weiterverfolge, damit sie die Tafel nicht belastet.

## Description
Ideen in Klärung und freigegebene Ideen lassen sich samt Gespräch entfernen. Überführte Ideen bleiben als Nachweis erhalten.

## Akzeptanzkriterien
- Der Button „Idee verwerfen“ steht am Ende der Karte „Stand der Idee.“.
- Der Button „Idee verwerfen“ ist bei einer Idee im Status `Übernommen` nicht sichtbar.
- Der Button „Idee verwerfen“ ist deaktiviert, solange die KI arbeitet.
- Ein Klick auf „Idee verwerfen“ öffnet einen Bestätigungsdialog mit dem Titel „Idee verwerfen.“.
- Der Bestätigungsdialog zeigt „»{Titel}« ({id}) wird samt Gesprächsverlauf entfernt. Diese Aktion kann nicht rückgängig gemacht werden.“.
- Der Bestätigungsdialog enthält den Button „Abbrechen“.
- Der Bestätigungsdialog enthält den Button „Verwerfen“.
- Nach der Bestätigung entfernt das Backend die Ideen-Datei.
- Nach der Bestätigung entfernt das Backend die Gesprächsdatei.
- War die Datei versioniert, erzeugt das Backend die Git-Version `idee: {id} {Titel} verworfen`.
- Eine fehlgeschlagene Git-Version verhindert das Verwerfen nicht.
- Beim Verwerfen wird das Event `idea` mit dem Titel „Idee {id} »{Titel}« verworfen“ und ohne `ref` ausgelöst.
- Das UI wechselt nach dem Verwerfen zu `#/ideen`.
- Das Backend antwortet bei einer Idee im Status `Übernommen` mit `409` und „Eine überführte Idee bleibt als Nachweis erhalten und lässt sich nicht löschen.“.
- Das Backend antwortet während einer KI-Runde mit `409` und „Die KI arbeitet noch an der letzten Antwort.“.
- Das Backend antwortet während einer laufenden Überführung der Idee mit `409` und „Diese Idee wird gerade in Anforderungen überführt.“.
