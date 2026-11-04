# Gesprochene Antworten zuordnen

## Meta
- **State:** Implemented

## User Story
Als Fachbereich möchte ich Rückfragen frei gesprochen beantworten, damit ich die Optionen nicht wörtlich aufsagen muss.

## Description
Im Gesprächsmodus ordnet die Oberfläche das Gesprochene den Optionen der aktuellen Rückfrage zu. Sie versucht nacheinander mehrere Erkennungswege. Was nicht passt, bleibt als freie Antwort erhalten.

## Akzeptanzkriterien
### Erkennung
- Die Zuordnung ignoriert Groß- und Kleinschreibung.
- Die Zuordnung ignoriert Satzzeichen.
- Bei einer Rückfrage mit `multiSelect` wählt das Wort „alle“ oder „alles“ alle Optionen.
- Eine Option gilt als genannt, wenn ihre vollständige Beschriftung als Wortfolge im Gesprochenen vorkommt.
- Ohne solchen Treffer gilt eine Option als genannt, wenn alle Wörter ihrer Beschriftung mit mindestens 4 Buchstaben im Gesprochenen vorkommen.
- Ohne solchen Treffer gilt eine Option als genannt, wenn das Gesprochene genau aus ihrer Ordnungszahl besteht.
- Ohne solchen Treffer gilt eine Option als genannt, wenn ihre Ordnungszahl auf „Option“, „Nummer“, „Variante“, „Antwort“, „die“, „der“, „das“ oder „den“ folgt.
- Die Oberfläche erkennt die Ordnungszahlen als Ziffer, Grundzahl („eins“) und Ordnungswort („erste“) bis zur vierten Option.
- Ohne solchen Treffer wählen „Empfehlung“, „empfohlen“, „Ihr Vorschlag“ oder „Ihrem Vorschlag“ die empfohlene Option.

### Übernahme
- Bei einer Rückfrage ohne `multiSelect` zählt nur der erste Treffer.
- Bei einer Rückfrage mit `multiSelect` zählen alle Treffer.
- Ohne Treffer wird das Gesprochene vollständig zur freien Antwort.
- Mit Treffer und mindestens 3 weiteren Wörtern wird das Gesprochene zusätzlich zur freien Antwort.
- Füllwörter wie „und“, „oder“, „ich“, „nehme“ und „bitte“ zählen nicht zu den weiteren Wörtern.
- Wörter aus den Beschriftungen der Optionen zählen nicht zu den weiteren Wörtern.

### Fortsetzung
- Nach der Zuordnung liest die Oberfläche die nächste Rückfrage vor.
- Die vorgelesene Rückfrage entspricht dem Format `Frage {n} von {m}. {Frage} Option 1: {Beschriftung}. Option 2: {Beschriftung}.`.
- Bei genau einer Rückfrage entfällt der Teil `Frage {n} von {m}.`.
- Bei der empfohlenen Option folgt auf die Beschriftung der Zusatz „, meine Empfehlung“.
- Nach der letzten Rückfrage sendet die Oberfläche alle Antworten automatisch.
