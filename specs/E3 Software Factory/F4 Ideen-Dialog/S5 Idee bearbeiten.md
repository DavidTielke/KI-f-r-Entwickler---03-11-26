# Idee bearbeiten

## Meta
- **State:** Implemented

## User Story
Als Fachbereich möchte ich das Ideen-Dokument selbst korrigieren und ergänzen, damit ich Ungenauigkeiten nicht erst im Gespräch klären muss.

## Description
Über den Stift am Stand der Idee öffnet sich ein Dialog mit den fachlichen Feldern des Dokuments. Das geht nur bei Ideen in Klärung und nur, wenn die KI gerade nicht arbeitet.

## Akzeptanzkriterien
### Aufruf
- Die Schaltfläche „Idee bearbeiten“ ist nur bei einer Idee im Status `Draft` sichtbar.
- Die Schaltfläche „Idee bearbeiten“ ist deaktiviert, solange die KI arbeitet.
- „Idee bearbeiten“ öffnet einen modalen Dialog.
- Der Dialog zeigt die Dachzeile „Ideen-Dokument“.
- Der Dialog zeigt den Titel „Idee bearbeiten.“.

### Felder
- Der Dialog enthält das Feld „Titel“ mit dem Wert aus `title`.
- Der Dialog enthält das mehrzeilige Feld „Problem und Nutzen“ mit dem Wert aus `problem`.
- Der Dialog enthält das mehrzeilige Feld „Lösungsidee“ mit dem Wert aus `solution`.
- Der Dialog enthält das mehrzeilige Feld „Das gehört dazu“ mit dem Wert aus `inScope`.
- Der Dialog enthält das mehrzeilige Feld „Das gehört nicht dazu“ mit dem Wert aus `outOfScope`.
- Der Dialog enthält das mehrzeilige Feld „Offene Punkte (je Zeile einer)“ mit den Werten aus `openPoints`.
- Der Platzhalter „…“ aus der Ideen-Datei erscheint als leeres Feld.
- Jedes Feld lässt sich diktieren.
- Im Feld „Offene Punkte (je Zeile einer)“ ergibt jede nicht leere Zeile einen Eintrag.

### Speichern
- Der Dialog enthält den Button „Abbrechen“.
- Der Dialog enthält den Button „Speichern“.
- „Abbrechen“ schließt den Dialog ohne Speicherung.
- „Speichern“ persistiert die Änderungen in der Ideen-Datei.
- Das Backend übernimmt ausschließlich die Felder `title`, `problem`, `solution`, `inScope`, `outOfScope` und `openPoints`.
- Bei leerem Titel behält das Backend den bisherigen Titel.
- Das Backend benennt die Datei bei einer Titeländerung um.
- Das Bearbeiten erzeugt keine Git-Version.
- Das Bearbeiten löst kein Event aus.

### Fehler
- Das Backend antwortet außerhalb des Status `Draft` mit `409` und „Diese Idee ist freigegeben. Öffnen Sie sie erneut, um weiter daran zu arbeiten.“.
- Das Backend antwortet während einer KI-Runde mit `409` und „Die KI arbeitet noch an der letzten Antwort.“.
- Das UI zeigt die Fehlermeldung des Backends im Dialog an.
