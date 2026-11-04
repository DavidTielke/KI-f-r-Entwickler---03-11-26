# Bearbeiten

## Meta
- **State:** Implemented

## User Story
Als Fachbereich möchte ich eine Anforderung selbst ändern, damit sie meinem aktuellen Bedarf entspricht.

## Description
Der Button „Bearbeiten“ öffnet dasselbe Formular wie beim Anlegen, vorausgefüllt und ohne Einordnung. Jede inhaltliche Änderung macht die Anforderung wieder offen, damit sie erneut umgesetzt wird.

## Akzeptanzkriterien
### Dialog
- „Bearbeiten“ öffnet einen modalen Dialog.
- Der Dialog zeigt die Dachzeile „Anforderung {Nummer}“.
- Der Dialog zeigt den Titel „Anforderung bearbeiten.“.
- Die Felder „Titel“, „Nutzen“, „Beschreibung“ und „Abnahmekriterien“ sind vorausgefüllt.
- Die Auswahlen „Themenbereich“ und „Funktion“ sind nicht sichtbar.
- Der Dialog enthält den Button „Abbrechen“.
- Der Dialog enthält den Button „Qualität prüfen“.
- Der Dialog enthält den Submit-Button „Speichern“.
- Bei einer umgesetzten Anforderung zeigt der Dialog „Diese Anforderung ist umgesetzt. Sobald Sie den Inhalt ändern, gilt sie wieder als offen und muss erneut umgesetzt werden.“.

### Speichern
- Das Backend validiert die Eingaben wie beim Anlegen (siehe S4).
- Bleiben `title`, `userStory`, `description` und `criteria` unverändert, ändert das Backend nichts und antwortet mit `changed` gleich `false`.
- Bei unverändertem Inhalt entsteht keine Git-Version.
- Bei unverändertem Inhalt wird kein Event ausgelöst.
- Eine inhaltliche Änderung setzt den Status auf `Modified`.
- Eine Titeländerung benennt die Datei in `S{n} {Titel}.md` um.
- Die Nummer der Anforderung bleibt bei einer Titeländerung stabil.
- Eine inhaltliche Änderung erzeugt die Git-Version `anforderung: {id} geändert`.
- Die Git-Version enthält nur die Datei dieser Anforderung, andere offene Änderungen bleiben außen vor.
- Bei einer inhaltlichen Änderung wird das Event `requirement` mit dem Titel „Anforderung {id} »{Titel}« geändert“ ausgelöst.
- Das Backend antwortet bei einem Werkzeug-Themenbereich mit `400` und „Der Themenbereich „Software Factory“ wird nicht über die Factory geändert.“.
- Das Backend antwortet bei einer unbekannten Kennung mit `404` und „Diese Anforderung existiert nicht mehr.“.
- Das UI zeigt die Fehlermeldung des Backends im Dialog an.
