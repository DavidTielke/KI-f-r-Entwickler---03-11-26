# Handlungsbedarf und laufende Aufträge

## Meta
- **State:** Implemented

## User Story
Als Fachbereich möchte ich sehen, was gerade meine Entscheidung braucht und welche Aufträge laufen, damit ich nichts übersehe und direkt weiterarbeiten kann.

## Description
Zwei Karten zeigen die aus dem tatsächlichen Stand abgeleiteten nächsten Schritte und die aktiven Aufträge. Jeder Eintrag führt direkt an die Stelle, an der es weitergeht.

## Akzeptanzkriterien
### Sichtbarkeit
- Beide Karten sind sichtbar, sobald es mindestens einen Handlungsbedarf oder einen aktiven Auftrag gibt.
- Ohne Handlungsbedarf und ohne aktiven Auftrag ist keine der beiden Karten sichtbar.

### Handlungsbedarf
- Die Karte zeigt die Dachzeile „Handlungsbedarf“.
- Die Karte zeigt den Titel „Das steht an.“.
- Ohne Eintrag steht dort „Im Moment ist nichts von Ihnen erforderlich.“.
- Die Karte zeigt höchstens die ersten 6 Einträge.
- Die Einträge folgen der Reihenfolge Ideen, Entwürfe, offene Anforderungen, nicht abgeschlossene Aufträge.
- Eine Idee im Status `Draft`, die 6 von 7 Reifegrad-Punkten erfüllt und an der die KI nicht arbeitet, erzeugt den Eintrag „Idee {id} »{Titel}« ist bereit zur Freigabe“.
- Der Eintrag „ist bereit zur Freigabe“ führt mit „Idee prüfen“ zu `#/ideen/{id}`.
- Eine andere Idee, die auf den Anwender wartet (`waitingForUser`), erzeugt den Eintrag „Idee {id} »{Titel}« wartet auf Ihre Antwort“.
- Der Eintrag „wartet auf Ihre Antwort“ einer Idee führt mit „Dialog fortsetzen“ zu `#/ideen/{id}`.
- Eine Idee im Status `Ready` erzeugt den Eintrag „Idee {id} »{Titel}« ist freigegeben“.
- Der Eintrag „ist freigegeben“ führt mit „Anforderungen erstellen“ zu `#/ideen/{id}`.
- Ein Entwurf, der auf den Anwender wartet (`waitingForUser`), erzeugt den Eintrag „Entwurf {id} »{Titel}« wartet auf Ihre Antwort“.
- Ein Entwurf ohne Titel erscheint in diesem Eintrag als „Neue Anforderung“.
- Der Eintrag eines Entwurfs führt mit „Gespräch fortsetzen“ zu `#/assistent/{id}`.
- Offene Anforderungen erzeugen den Eintrag „1 Anforderung wartet auf die Umsetzung“ beziehungsweise „{n} Anforderungen warten auf die Umsetzung“.
- Der Eintrag zu offenen Anforderungen führt mit „Anforderungen auswählen“ zu `#/anforderungen?filter=offen`.
- Ein Auftrag mit `canDiscard` erzeugt den Eintrag „Auftrag {id} wurde nicht abgeschlossen und benötigt eine Entscheidung“.
- Der Eintrag zu einem Auftrag führt mit „Auftrag öffnen“ zu `#/umsetzung/{id}`.
- Einträge „ist bereit zur Freigabe“ und „wartet auf Ihre Antwort“ sind orange markiert.
- Einträge „ist freigegeben“ und zu offenen Anforderungen sind grün markiert.
- Einträge zu Aufträgen sind als Fehler markiert.

### Laufende Aufträge
- Die Karte zeigt die Dachzeile „Fertigung“.
- Die Karte zeigt den Titel „Laufende Aufträge.“.
- Die Karte listet alle Aufträge mit dem Status `queued` oder `running`.
- Ohne aktiven Auftrag steht dort „Derzeit läuft kein Auftrag.“.
- Ein Eintrag zeigt die Nummer des Auftrags.
- Ein Eintrag zeigt die Art „Umsetzung“, „Überführung“ oder „Rücknahme“ gefolgt vom Titel des Auftrags.
- Ein laufender Auftrag zeigt die Bezeichnung seiner aktiven Phase.
- Ein laufender Auftrag ohne aktive Phase zeigt „Läuft“.
- Ein wartender Auftrag zeigt „Wartet“.
- Ein Eintrag führt zu `#/umsetzung/{id}`.
