# Tier-Zuordnung im Anlegen-Dialog

## Meta
- **State:** Implemented

## User Story
Als Administration möchte ich beim Anlegen einer Person gleichzeitig ein Haustier zuordnen, damit die Verknüpfung nicht in zwei Schritten erledigt werden muss.

## Description
Der Anlegen-Dialog (siehe F3 S1) enthält ein optionales Feld `Haustier`, mit dem die 1:1-Verknüpfung aus der Personen-Ansicht hergestellt werden kann. Bereits mit einer anderen Person verknüpfte Haustiere werden ausgegraut (siehe E2 `_Datenstruktur.md`).

## Akzeptanzkriterien
- Der Anlegen-Dialog enthält das Feld `Haustier` als Auswahl mit der Option „Kein Haustier" und allen persistierten Haustieren.
- Die `Haustier`-Optionen zeigen `Name` und `Species` des Tiers im Format „{Name} ({Species})".
- Ein Haustier, das bereits mit einer anderen Person verknüpft ist, ist in der Auswahl ausgegraut und nicht wählbar.
- Das Feld `Haustier` ist optionales Feld; bei Dialog-Öffnung ist „Kein Haustier" angezeigt.
- Bei Auswahl eines Haustiers sendet der Dialog die `POST /api/persons`-Anfrage mit dessen `PetId`.
- Ohne Auswahl sendet der Dialog die Anfrage ohne `PetId`.
