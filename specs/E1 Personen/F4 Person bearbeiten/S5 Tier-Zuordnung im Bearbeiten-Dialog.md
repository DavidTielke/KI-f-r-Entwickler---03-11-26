# Tier-Zuordnung im Bearbeiten-Dialog

## Meta
- **State:** Implemented

## User Story
Als Administration möchte ich im Bearbeiten-Dialog die Haustier-Zuordnung einer Person ändern oder auflösen, damit die Verknüpfung gepflegt werden kann.

## Description
Der Bearbeiten-Dialog (siehe F4 S2) enthält das optionale Feld `Haustier` (siehe F3 S5), das mit dem aktuell verknüpften Haustier vorausgefüllt ist. Über die Auswahl kann ein anderes Haustier zugeordnet oder die Verknüpfung gelöst werden.

## Akzeptanzkriterien
- Der Bearbeiten-Dialog enthält das Feld `Haustier` als Auswahl mit der Option „Kein Haustier" und allen persistierten Haustieren.
- Das Feld `Haustier` ist mit dem aktuell verknüpften Haustier vorausgefüllt; ohne Verknüpfung ist „Kein Haustier" angezeigt.
- Das aktuell verknüpfte Haustier ist in der Auswahl wählbar und nicht ausgegraut.
- Ein Haustier, das bereits mit einer anderen Person verknüpft ist, ist in der Auswahl ausgegraut und nicht wählbar.
- Die Auswahl „Kein Haustier" löst die Verknüpfung: Die `PUT /api/persons/{id}`-Anfrage wird ohne `PetId` gesendet.
- Bei Auswahl eines anderen Haustiers wird die `PUT /api/persons/{id}`-Anfrage mit dessen `PetId` gesendet.
