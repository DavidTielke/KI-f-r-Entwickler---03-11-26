# Erneut beauftragen

## Meta
- **State:** Implemented

## User Story
Als Fachbereich möchte ich einen gescheiterten oder abgebrochenen Auftrag mit einem Klick neu starten, damit ich die Anforderungen nicht erneut zusammenstellen muss.

## Description
Ein gescheiterter oder abgebrochener Auftrag lässt sich neu beauftragen, sobald keine nicht gesicherten Änderungen mehr im Weg stehen. Dabei entsteht ein neuer Auftrag.

## Akzeptanzkriterien
- Der Button „Erneut beauftragen“ ist bei den Status `failed` und `canceled` sichtbar.
- Der Button ist bei gesetztem `canDiscard` nicht sichtbar.
- Der Button ist bei einem Auftrag vom Typ `revert` nicht sichtbar.
- Das Backend antwortet mit `202` und der Kennung des neuen Auftrags.
- Bei einem Auftrag vom Typ `delivery` umfasst der neue Auftrag nur die noch nicht umgesetzten Anforderungen.
- Bei einem Auftrag vom Typ `transfer` entsteht eine neue Überführung derselben Idee.
- Für den neuen Auftrag gelten dieselben Prüfungen wie bei einer neuen Beauftragung (siehe S1 und F6 S1).
- Das UI wechselt zu `#/umsetzung/{id}` des neuen Auftrags.
- Das Backend antwortet bei gesetztem `canDiscard` mit `409` und „Bitte verwerfen Sie zuerst die Änderungen des abgebrochenen Laufs.“.
- Das Backend antwortet bei einem Auftrag vom Typ `revert` mit `409` und „Dieser Auftrag lässt sich nicht wiederholen.“.
- Das UI zeigt die Fehlermeldung des Backends auf der Seite an.
- Das Backend antwortet, wenn alle Anforderungen des Auftrags umgesetzt sind, mit `409` und „Alle Anforderungen dieses Auftrags sind bereits umgesetzt.“.
