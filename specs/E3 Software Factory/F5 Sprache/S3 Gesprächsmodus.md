# Gesprächsmodus

## Meta
- **State:** Implemented

## User Story
Als Fachbereich möchte ich das Gespräch mit der KI vollständig per Stimme führen, damit ich meine Idee nebenbei und ohne Tastatur klären kann.

## Description
Im Gesprächsmodus liest die Anwendung jede Antwort vor und hört danach zu. Eine kurze Pause beendet den eigenen Beitrag, der dann automatisch gesendet wird. Der Modus gilt im Ideen-Dialog und im Anforderungs-Assistenten.

## Akzeptanzkriterien
### Ein- und Ausschalten
- Der Button „Gesprächsmodus starten“ steht im Kopf des Gesprächs.
- Der Button ist nur sichtbar, wenn der Browser Spracherkennung unterstützt.
- Der Button ist in einem schreibgeschützten Gespräch nicht sichtbar.
- Im aktiven Gesprächsmodus heißt der Button „Gesprächsmodus beenden“.
- Die Äußerung „stopp“, „stop“, „beenden“ oder „Gesprächsmodus beenden“ beendet den Gesprächsmodus.
- Das Beenden stoppt die Sprachausgabe und das Mikrofon.
- Ist die letzte Nachricht eine Antwort der KI, liest die Oberfläche sie beim Einschalten noch einmal vor.
- Im Gesprächsmodus ist die Mikrofon-Schaltfläche am Eingabefeld nicht sichtbar.

### Ablauf
- Eine neue Antwort der KI wird automatisch vorgelesen.
- Enthält die Antwort Rückfragen, liest die Oberfläche anschließend die erste Rückfrage mit ihren Optionen vor.
- Nach dem Vorlesen startet das Mikrofon automatisch.
- Während des Vorlesens ist das Mikrofon aus.
- Solange die KI arbeitet, ist das Mikrofon aus.
- Eine Sprechpause von 1,8 Sekunden beendet den Beitrag.
- Ohne offene Rückfragen sendet die Oberfläche den Beitrag als Nachricht.
- Mit offenen Rückfragen ordnet die Oberfläche den Beitrag der aktuellen Rückfrage zu (siehe S4).
- Schlägt das Senden fehl, startet das Mikrofon erneut.
- Endet eine KI-Runde mit einem Fehler, liest die Oberfläche die Fehlermeldung vor und startet danach das Mikrofon.
- Beim Verlassen des Gesprächs endet die Sprachausgabe.

### Statusband
- Im aktiven Gesprächsmodus ist über dem Eingabefeld ein Statusband sichtbar.
- Beim Zuhören zeigt das Band das vorläufige Ergebnis der Erkennung.
- Beim Zuhören ohne vorläufiges Ergebnis zeigt das Band „Ich höre Ihnen zu. Eine kurze Pause beendet Ihren Beitrag.“.
- Beim Vorlesen zeigt das Band „{Name} spricht“.
- Während die KI arbeitet, zeigt das Band „{Name} denkt nach“.
- Beim Vorlesen ist der Button „Vorlesen überspringen“ sichtbar.
- „Vorlesen überspringen“ beendet die Sprachausgabe und startet das Mikrofon.
