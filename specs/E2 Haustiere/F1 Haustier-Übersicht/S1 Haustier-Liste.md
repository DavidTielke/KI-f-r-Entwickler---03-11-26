# Haustier-Liste

## Meta
- **State:** Implemented

## User Story
Als Administration möchte ich alle Haustiere in einer Tabelle sehen, damit ich den Bestand auf einen Blick überblicke.

## Description
Die Haustiere-Seite zeigt die Haustiere als Tabelle in einer Tabellenkarte. Die Kopfzeile zeigt den Kicker „Stammdaten", die Überschrift „Haustiere" und die Primäraktion „Anlegen" (siehe F2 S1). Jede Zeile zeigt die Stammdaten des Tiers, die verknüpfte Person sowie die Zeilenaktionen Bearbeiten und Löschen (siehe F3 S1, F4 S1).

## Akzeptanzkriterien
### Ansicht
- Die Haustiere-Seite zeigt die Kopfzeile mit dem Kicker „Stammdaten" und der Überschrift „Haustiere".
- Die Kopfzeile enthält die Primäraktion „Anlegen".
- Der Hauptbereich zeigt die Haustiere in einer Tabellenkarte.
- Die Tabelle zeigt eine Zeile pro persistiertem Haustier.
- Die Tabelle enthält die Spalten „ID", „Name", „Spezies", „Person" und die Spalte für die Zeilenaktionen.

### Inhalt
- Die Spalte „ID" zeigt die `Id` im Format `#{id}`.
- Die Spalte „Name" zeigt den `Name` des Tiers.
- Die Spalte „Spezies" zeigt den `Species`-Wert des Tiers.
- Die Spalte „Person" zeigt den `Name` der verknüpften Person.
- Die Spalte „Person" zeigt „—", wenn das Tier nicht mit einer Person verknüpft ist.

### Sortierung
- Das Backend liefert die Haustiere nach `Name` aufsteigend.
- Bei gleichem `Name`-Wert liefert das Backend die Haustiere nach `Id` sortiert.
- Die Tabelle zeigt die Haustiere in der vom Backend gelieferten Reihenfolge.
