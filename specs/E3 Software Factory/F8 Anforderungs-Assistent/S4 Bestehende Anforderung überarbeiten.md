# Bestehende Anforderung überarbeiten

## Meta
- **State:** Implemented

## User Story
Als Fachbereich möchte ich eine bestehende Anforderung im Gespräch mit dem Assistenten überarbeiten, damit ich Änderungen in eigenen Worten beschreiben kann.

## Description
Auf der Detailseite startet ein Gespräch über die gewünschte Änderung. Der Assistent arbeitet auf einer Kopie. Die Anforderung ändert sich erst beim Speichern, die Einordnung bleibt dabei unverändert.

## Akzeptanzkriterien
### Einstieg
- Der Button „Mit Assistent überarbeiten“ steht auf der Detailseite einer änderbaren Anforderung (siehe F7 S3).
- Der Button öffnet einen modalen Dialog.
- Der Dialog zeigt die Dachzeile „Anforderung {Nummer}“.
- Der Dialog zeigt den Titel „Mit dem Assistenten überarbeiten.“.
- Das Textfeld trägt die Beschriftung „Was soll sich ändern“.
- Das Textfeld zeigt den Platzhalter „Beschreiben Sie, was an dieser Anforderung anders werden soll.“.
- Der Dialog enthält den Button „Abbrechen“.
- Der Dialog enthält den Button „Gespräch starten“.

### Gespräch
- Das Backend übernimmt `title`, `userStory`, `description`, `criteria` und die Einordnung der Anforderung in den Entwurf.
- Das Backend merkt sich die Anforderung im Feld `storyId` des Entwurfs.
- Die Datei der Anforderung bleibt bis zum Speichern unverändert.
- Die Seite zeigt die Dachzeile „Überarbeitung von {Nummer}“.
- Die Einordnung bleibt erhalten, auch wenn die KI eine andere vorschlägt.
- Das Formular „Entwurf bearbeiten.“ zeigt die Auswahlen „Themenbereich“ und „Funktion“ nicht.

### Speichern
- Der Kopfbereich zeigt den Button „Änderung speichern“.
- Das Backend wendet die Regeln für eine inhaltliche Änderung an (siehe F7 S5).
- Das Speichern erzeugt die Git-Version `anforderung: {id} überarbeitet`.
- Beim Speichern wird das Event `requirement` mit dem Titel „Anforderung {id} »{Titel}« mit dem Assistenten überarbeitet“ ausgelöst.
- Der Entwurf erhält den Status `saved`.
- Das UI wechselt nach dem Speichern zu `#/anforderungen/{id}`.
