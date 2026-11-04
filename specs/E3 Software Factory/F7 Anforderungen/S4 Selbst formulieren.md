# Selbst formulieren

## Meta
- **State:** Implemented

## User Story
Als Fachbereich möchte ich eine Anforderung ohne KI-Gespräch selbst erfassen, damit ich klare Anliegen direkt festhalten kann.

## Description
Das Formular nimmt Einordnung, Titel, Nutzen, Beschreibung und Abnahmekriterien auf. Jedes Textfeld lässt sich diktieren. Die Qualitätsprüfung steht auch hier zur Verfügung (siehe F9 S1). Das Formular öffnet sich über den Weg „Selbst formulieren“ (siehe F8 S1).

## Akzeptanzkriterien
### Dialog
- Der Dialog zeigt die Dachzeile „Neue Anforderung“.
- Der Dialog zeigt den Titel „Anforderung formulieren.“.
- Der Dialog enthält den Button „Abbrechen“.
- Der Dialog enthält den Button „Qualität prüfen“.
- Der Dialog enthält den Submit-Button „Anlegen“.
- „Abbrechen“ schließt den Dialog ohne Speicherung.
- Die Schaltfläche „Lieber im Gespräch mit dem KI-Assistenten entwickeln“ wechselt zum Einstieg des Assistenten.

### Einordnung
- Die Auswahl „Themenbereich“ enthält alle Themenbereiche außer den Werkzeug-Themenbereichen.
- Die Auswahl „Themenbereich“ enthält die Option „Neuer Themenbereich …“.
- Bei „Neuer Themenbereich …“ ist das Feld mit dem Platzhalter „Name des Themenbereichs“ sichtbar.
- Die Auswahl „Funktion“ enthält die Funktionen des gewählten Themenbereichs.
- Die Auswahl „Funktion“ enthält die Option „Neue Funktion …“.
- Bei „Neue Funktion …“ ist das Feld mit dem Platzhalter „Name der Funktion“ sichtbar.
- Ein Wechsel des Themenbereichs setzt die Auswahl „Funktion“ auf „Neue Funktion …“.
- Ein in der Liste gewählter Themenbereich ist vorbelegt.
- Eine in der Liste gewählte Funktion ist vorbelegt.
- Ohne Einschränkung in der Liste ist der erste Themenbereich vorbelegt.

### Felder
- Das Feld „Titel“ zeigt den Platzhalter „Kurz und aussagekräftig“.
- Beim Öffnen des Dialogs liegt der Fokus im Feld „Titel“.
- Das Feld „Nutzen“ zeigt den Platzhalter „Als … möchte ich …, damit …“.
- Das Feld „Beschreibung“ zeigt den Platzhalter „Was soll die Anwendung fachlich tun?“.
- Der Bereich „Abnahmekriterien“ startet mit einer leeren Zeile.
- Eine Kriteriums-Zeile zeigt den Platzhalter „Eine prüfbare Aussage, zum Beispiel: Das Feld Name ist ein Pflichtfeld.“.
- Die Enter-Taste in einer Kriteriums-Zeile fügt eine neue Zeile an.
- Der Button „Kriterium hinzufügen“ fügt eine neue Zeile an.
- Die Schaltfläche „Kriterium entfernen“ entfernt die Zeile.

### Prüfung im Backend
- Das Backend antwortet bei leerem Titel mit `400` und „Bitte geben Sie der Anforderung einen Titel.“.
- Das Backend antwortet bei einem Titel über 120 Zeichen mit `400` und „Der Titel darf höchstens 120 Zeichen lang sein.“.
- Das Backend antwortet bei leerem Nutzen mit `400` und „Bitte beschreiben Sie den Nutzen in einem Satz.“.
- Das Backend antwortet ohne Kriterium mit `400` und „Bitte erfassen Sie mindestens ein Abnahmekriterium.“.
- Das Backend entfernt leere Kriteriums-Zeilen.
- Das Backend antwortet ohne Themenbereich mit `400` und „Bitte wählen Sie einen Themenbereich.“.
- Das Backend antwortet ohne Funktion mit `400` und „Bitte wählen Sie eine Funktion.“.
- Das Backend antwortet bei einem Werkzeug-Themenbereich mit `400` und „Der Themenbereich „Software Factory“ wird nicht über die Factory geändert.“.
- Das UI zeigt die Fehlermeldung des Backends im Dialog an.

### Anlage
- Ein neuer Themenbereich erhält die nächste freie Nummer.
- Ein neuer Name, der einem vorhandenen Themenbereich ohne Beachtung der Groß- und Kleinschreibung entspricht, verwendet diesen Themenbereich.
- Eine neue Funktion erhält die nächste freie Nummer im Themenbereich.
- Ein neuer Name, der einer vorhandenen Funktion ohne Beachtung der Groß- und Kleinschreibung entspricht, verwendet diese Funktion.
- Die neue Anforderung erhält die nächste freie Nummer der Funktion.
- Die Datei entspricht dem Format `S{n} {Titel}.md`.
- Unter Windows verbotene Zeichen im Dateinamen werden durch `-` ersetzt.
- Die neue Anforderung trägt den Status `Modified`.
- Das Anlegen erzeugt die Git-Version `anforderung: {id} {Titel} angelegt`.
- Die Git-Version enthält nur die Datei dieser Anforderung, andere offene Änderungen bleiben außen vor.
- Beim Anlegen wird das Event `requirement` mit dem Titel „Anforderung {id} »{Titel}« angelegt“ ausgelöst.
- Das Backend antwortet mit `201`.
- Das UI wechselt nach dem Anlegen zu `#/anforderungen/{id}`.
