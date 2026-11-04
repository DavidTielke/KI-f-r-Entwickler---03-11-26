# Entwurf bearbeiten und speichern

## Meta
- **State:** Implemented

## User Story
Als Fachbereich möchte ich den Entwurf des Assistenten selbst anpassen und als Anforderung speichern oder verwerfen, damit das Ergebnis genau meinem Bedarf entspricht.

## Description
Der Entwurf lässt sich über das bekannte Formular ändern. Erst das Speichern erzeugt die Anforderung im Bestand. Ein Entwurf lässt sich auch verwerfen, wenn er nicht mehr gebraucht wird.

## Akzeptanzkriterien
### Bearbeiten
- Die Schaltfläche „Entwurf selbst bearbeiten“ ist deaktiviert, solange die KI arbeitet.
- Die Schaltfläche „Entwurf selbst bearbeiten“ ist bei einem gespeicherten Entwurf deaktiviert.
- Die Schaltfläche öffnet das Anforderungs-Formular mit dem Titel „Entwurf bearbeiten.“.
- Das Formular zeigt die Dachzeile „Entwurf {Kennung}“.
- Bei einem neuen Entwurf sind die Auswahlen „Themenbereich“ und „Funktion“ mit der Einordnung des Entwurfs vorbelegt.
- Der Button „Speichern“ persistiert die Eingaben im Entwurf.
- Das Bearbeiten legt keine Datei unter `specs/` an.
- Das Backend antwortet während einer KI-Runde mit `409` und „Die KI arbeitet noch an der letzten Antwort.“.

### Speichern
- Der Kopfbereich zeigt den Button „Anforderung anlegen“.
- Der Button ist deaktiviert, solange `title` leer ist.
- Der Button ist deaktiviert, solange `userStory` leer ist.
- Der Button ist deaktiviert, solange kein Abnahmekriterium vorliegt.
- Der Button ist deaktiviert, solange die KI arbeitet.
- Der Button ist bei einem gespeicherten Entwurf deaktiviert.
- Das Backend validiert die Eingaben wie beim Anlegen (siehe F7 S4).
- Das Speichern legt die Anforderung mit dem Status `Modified` an.
- Das Speichern erzeugt die Git-Version `anforderung: {id} {Titel} angelegt`.
- Beim Speichern wird das Event `requirement` mit dem Titel „Anforderung {id} »{Titel}« mit dem Assistenten angelegt“ ausgelöst.
- Der Entwurf erhält den Status `saved`.
- Der Entwurf merkt sich die neue Kennung im Feld `savedStory`.
- Das UI wechselt nach dem Speichern zu `#/anforderungen/{id}`.
- Das UI zeigt eine Fehlermeldung des Backends im Seitenbereich an.
- Ein gespeicherter Entwurf erscheint nicht mehr unter „Entwürfe im Gespräch.“.
- Das Gespräch eines gespeicherten Entwurfs zeigt „Dieser Entwurf wurde gespeichert.“.

### Verwerfen
- Die Schaltfläche „Entwurf verwerfen“ ist deaktiviert, solange die KI arbeitet.
- Ein Klick öffnet einen Bestätigungsdialog mit dem Titel „Entwurf verwerfen.“.
- Der Bestätigungsdialog zeigt „Der Entwurf und das Gespräch werden entfernt. Diese Aktion kann nicht rückgängig gemacht werden.“.
- Der Bestätigungsdialog enthält den Button „Abbrechen“.
- Der Bestätigungsdialog enthält den Button „Verwerfen“.
- Das Backend entfernt die Gesprächsdatei des Entwurfs.
- Das UI wechselt nach dem Verwerfen zu `#/anforderungen`.
- Das Backend antwortet bei einem bereits gespeicherten Entwurf mit `409` und „Dieser Entwurf wurde bereits gespeichert.“.
