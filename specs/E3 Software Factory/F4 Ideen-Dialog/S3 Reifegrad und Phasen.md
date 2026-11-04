# Reifegrad und Phasen

## Meta
- **State:** Implemented

## User Story
Als Fachbereich möchte ich sehen, in welcher Phase das Gespräch steht und welche Punkte der Definition of Ready noch fehlen, damit ich weiß, wie weit die Idee ist.

## Description
Über dem Gespräch zeigt ein Band die fünf Phasen des Ideen-Dialogs. Im Seitenbereich steht der Reifegrad als Liste der sieben Punkte der Definition of Ready.

## Akzeptanzkriterien
### Phasen
- Das Band zeigt die Phasen „Verstehen“, „Hinterfragen“, „Machbarkeit“, „Verfeinern“ und „Abschließen“.
- Die aktuelle Phase ergibt sich aus dem Feld `phase` der letzten KI-Runde.
- Die aktuelle Phase ist aktiv markiert.
- Phasen vor der aktuellen Phase sind als erledigt markiert.
- Phasen nach der aktuellen Phase zeigen ihre Nummer.
- Ohne bekannte Phase ist „Verstehen“ aktiv markiert.
- Bei einer Idee außerhalb des Status `Draft` sind alle Phasen als erledigt markiert.

### Reifegrad
- Die Karte zeigt die Dachzeile „Definition of Ready“.
- Die Karte zeigt den Titel „Reifegrad.“.
- Die Karte zeigt den Stand im Format `{n}/7`.
- Die Liste enthält „Problem und Nutzen sind klar formuliert“.
- Die Liste enthält „Die Zielgruppe ist benannt“.
- Die Liste enthält „Der Umfang ist abgegrenzt“.
- Die Liste enthält „Das gewünschte Verhalten ist konkret beschrieben“.
- Die Liste enthält „Die Machbarkeit ist gegen den Bestand geprüft“.
- Die Liste enthält „Es gibt keine offenen Punkte mehr“.
- Die Liste enthält „Sie haben die finale Fassung bestätigt“.
- Ein erfüllter Punkt zeigt ein Häkchen.

### Herleitung
- Die ersten fünf Punkte ergeben sich aus den Feldern `problem`, `audience`, `scope`, `behavior` und `feasibility` von `readiness` der letzten KI-Runde.
- „Es gibt keine offenen Punkte mehr“ ist erfüllt, wenn `openPoints` leer ist und `readiness.problem` wahr ist.
- „Sie haben die finale Fassung bestätigt“ ist nur außerhalb des Status `Draft` erfüllt.
- Außerhalb des Status `Draft` sind alle 7 Punkte erfüllt.
- Sind alle Punkte außer der Bestätigung erfüllt und arbeitet die KI nicht, erscheint „Alle Punkte sind erfüllt. Bitte prüfen Sie das Dokument und geben Sie die Idee frei.“.
