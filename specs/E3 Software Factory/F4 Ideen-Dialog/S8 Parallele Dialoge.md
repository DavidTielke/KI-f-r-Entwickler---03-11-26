# Parallele Dialoge

## Meta
- **State:** Implemented

## User Story
Als Fachbereich möchte ich mehrere Gespräche gleichzeitig führen, damit ich nicht warten muss, bis die KI eine andere Idee oder einen anderen Entwurf fertig bearbeitet hat.

## Description
Gespräche laufen unabhängig voneinander im Hintergrund, weil die KI dabei nur liest. Das gilt für Ideen-Dialoge und Entwürfe des Anforderungs-Assistenten gemeinsam. Auch ein laufender Auftrag blockiert sie nicht.

## Akzeptanzkriterien
### Gleichzeitigkeit
- Mehrere Gespräche lassen sich gleichzeitig führen.
- Das Backend führt höchstens 4 KI-Runden gleichzeitig aus.
- Die Grenze von 4 KI-Runden gilt für Ideen-Dialoge und Anforderungs-Assistent gemeinsam.
- Weitere KI-Runden warten, bis eine Runde beendet ist.
- Ein Gespräch gilt schon während der Wartezeit als arbeitend (`busy`).
- Ein laufender Auftrag blockiert Gespräche nicht.
- Während einer KI-Runde lässt sich zu anderen Ansichten wechseln, ohne dass die Runde endet.

### Je Gespräch
- Ein Gespräch führt höchstens eine KI-Runde gleichzeitig aus.
- Das Backend antwortet auf eine weitere Nachricht während einer KI-Runde mit `409` und „Die KI arbeitet noch an der letzten Antwort.“.
- Das Backend persistiert Verlauf und Arbeitsschritte eines Gesprächs in `code/factory/data/sessions/{id}.json`.
- Das Backend bewahrt je Gespräch höchstens die letzten 30 Arbeitsschritte der laufenden Runde auf.

### Neustart des Dienstes
- Ein Neustart beendet laufende KI-Runden.
- Der Gesprächsverlauf bleibt nach einem Neustart erhalten.
- Eine unterbrochene Runde zeigt nach dem Neustart „Die Antwort wurde durch einen Neustart unterbrochen. Bitte versuchen Sie es erneut.“.
