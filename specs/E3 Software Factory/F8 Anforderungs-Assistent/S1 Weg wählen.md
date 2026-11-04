# Weg wählen

## Meta
- **State:** Implemented

## User Story
Als Fachbereich möchte ich beim Anlegen entscheiden, ob ich die Anforderung mit dem KI-Assistenten entwickle oder selbst formuliere, damit ich den für mein Anliegen passenden Weg nutze.

## Description
Die Primäraktion „Anforderung anlegen“ bietet zwei Wege an. Der Weg mit dem Assistenten beginnt mit einer kurzen Beschreibung des Anliegens und führt dann ins Gespräch.

## Akzeptanzkriterien
### Auswahl
- Die Primäraktion „Anforderung anlegen“ öffnet einen modalen Dialog.
- Der Dialog zeigt die Dachzeile „Neue Anforderung“.
- Der Dialog zeigt den Titel „Anforderung anlegen.“.
- Der Dialog bietet die Option „Mit dem KI-Assistenten entwickeln“.
- Diese Option zeigt „Sie erzählen per Stimme oder Text, was Sie brauchen. Der Assistent fragt nach und formuliert die Anforderung aus.“.
- Der Dialog bietet die Option „Selbst formulieren“.
- Diese Option zeigt „Sie schreiben oder diktieren alle Angaben selbst. Die Qualitätsprüfung steht Ihnen trotzdem zur Verfügung.“.
- „Selbst formulieren“ öffnet das Formular (siehe F7 S4).
- „Mit dem KI-Assistenten entwickeln“ öffnet den Einstieg des Assistenten.

### Einstieg des Assistenten
- Der Einstieg zeigt die Dachzeile „KI-Assistent“.
- Der Einstieg zeigt den Titel „Anforderung entwickeln.“.
- Das Textfeld trägt die Beschriftung „Was soll die Anwendung künftig können“.
- Das Textfeld zeigt den Platzhalter „Beschreiben Sie in eigenen Worten, was Sie brauchen und wofür.“.
- Der Einstieg enthält den Button „Abbrechen“.
- Der Einstieg enthält den Button „Gespräch starten“.
- Bei leerem Textfeld zeigt das UI „Bitte beschreiben Sie Ihr Anliegen.“.
- Das Backend antwortet bei leerem Text mit `400` und „Bitte beschreiben Sie, was die Anwendung künftig können soll.“.

### Start
- Das Backend vergibt die nächste Kennung im Format `A{n}`.
- Das Backend persistiert den Entwurf in `code/factory/data/sessions/A{n}.json`.
- Der neue Entwurf trägt den Status `open`.
- Der Start legt noch keine Datei unter `specs/` an.
- Der eingegebene Text wird als erste Nachricht des Gesprächs persistiert.
- Das Backend startet die erste KI-Runde im Hintergrund.
- Das UI wechselt nach dem Start zu `#/assistent/{id}`.
