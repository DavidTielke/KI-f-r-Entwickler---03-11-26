# Herkunft der Anforderungen

## Meta
- **State:** Implemented

## User Story
Als Fachbereich möchte ich an einer Anforderung sehen, aus welcher Idee sie stammt, damit ich den Hintergrund einer Entscheidung nachlesen kann.

## Description
Die Anforderungs-Detailseite nennt die Herkunft. Die Factory leitet sie aus den Einträgen im Abschnitt „Übergang zu Specs“ der Ideen-Dateien ab, sodass auch von Hand gepflegte Ideen erkannt werden.

## Akzeptanzkriterien
### Anzeige
- Die Karte „Einordnung.“ zeigt die Zeile „Herkunft“.
- Bei erkannter Herkunft steht dort „Idee {id} »{Titel}«“.
- Die erkannte Herkunft führt zu `#/ideen/{id}`.
- Ohne erkannte Herkunft steht dort „Direkt erfasst“.

### Ableitung
- Das Backend wertet den Abschnitt `## Übergang zu Specs` aller Ideen-Dateien aus.
- Das Backend wertet nur Angaben in Backticks aus.
- Eine Angabe, die mit `specs/` beginnt, gilt als vollständiger Pfad.
- Eine Angabe zu einer Unterlage wie `specs/E2 Haustiere/_Datenstruktur.md` gilt nicht als Ziel.
- Eine Angabe wie `F3 Person anlegen/S5` gilt als Kurzform unter dem zuvor in der Zeile genannten Themenbereich.
- Enthält eine Zeile Kurzformen, zählen in dieser Zeile nur die Kurzformen.
- Die Endung `.md` einer Angabe bleibt beim Vergleich unberücksichtigt.
- Eine Angabe auf einen Themenbereich erfasst alle Anforderungen darunter.
- `…/S5` erfasst nicht die Anforderung `…/S50`.
- Treffen mehrere Angaben zu, gewinnt die längste Angabe.
