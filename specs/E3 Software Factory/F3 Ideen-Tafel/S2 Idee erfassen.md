# Idee erfassen

## Meta
- **State:** Implemented

## User Story
Als Fachbereich möchte ich eine grobe Idee in eigenen Worten eintippen oder einsprechen, damit daraus im Gespräch mit dem Product Owner eine ausgereifte Idee entsteht.

## Description
Die Aktion „Idee erfassen“ öffnet einen Dialog, in dem die Idee beschrieben wird. Nach dem Start legt die Factory die Idee an und der Product Owner beginnt das Gespräch. Das Einsprechen beschreibt F5 S2.

## Akzeptanzkriterien
### Dialog
- Die Primäraktion „Idee erfassen“ öffnet einen modalen Dialog.
- Die Adresse `#/ideen?neu=1` öffnet denselben Dialog.
- Nach dem Öffnen über `#/ideen?neu=1` wechselt die Adresse zu `#/ideen`.
- Der Dialog zeigt die Dachzeile „Neue Idee“.
- Der Dialog zeigt den Titel „Idee erfassen.“.
- Der Dialog enthält ein mehrzeiliges Textfeld mit der Beschriftung „Ihre Idee“.
- Das Textfeld zeigt den Platzhalter „Beschreiben Sie, was Sie stört oder was künftig möglich sein soll. Es muss nicht perfekt sein.“.
- Der Dialog enthält den Button „Abbrechen“.
- Der Dialog enthält den Button „Dialog starten“.
- „Abbrechen“ schließt den Dialog ohne Speicherung.
- Die Escape-Taste schließt den Dialog ohne Speicherung.
- Ein Klick neben den Dialog schließt ihn ohne Speicherung.

### Validierung
- Das Textfeld wird client- und serverseitig als Pflichtfeld validiert.
- Bei leerem Textfeld zeigt das UI „Bitte beschreiben Sie Ihr Anliegen.“.
- Das Backend antwortet bei leerem Text mit `400` und „Bitte beschreiben Sie Ihre Idee.“.

### Anlage
- Das Backend vergibt die nächste freie Kennung `I{n}` über alle Ideen-Dateien und Gesprächsdateien.
- Die Idee wird als `ideas/I{n} Neue Idee.md` persistiert.
- Die neue Idee trägt den Titel „Neue Idee“.
- Die neue Idee trägt den Status `Draft`.
- Der eingegebene Text wird im Feld `problem` persistiert.
- Der eingegebene Text wird als erste Nachricht des Gesprächs persistiert.
- Das Gespräch startet mit der Phase `verstehen`.
- Bei der Anlage wird das Event `idea` mit dem Titel „Idee {id} erfasst“ ausgelöst.
- Die Anlage erzeugt keine Git-Version.
- Das Backend startet die erste KI-Runde im Hintergrund.
- Das UI wechselt nach der Anlage zu `#/ideen/{id}`.
- Schlägt die Anlage fehl, zeigt der Dialog die Fehlermeldung des Backends an und bleibt geöffnet.
