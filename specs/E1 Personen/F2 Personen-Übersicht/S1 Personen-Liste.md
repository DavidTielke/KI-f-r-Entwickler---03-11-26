# Personen-Liste

## Meta
- **State:** Implemented

## User Story
Als Administration möchte ich alle Personen in einer Tabelle sehen, damit ich den Bestand auf einen Blick überblicke.

## Description
Der Hauptbereich der Personen-Seite zeigt die Personen als Tabelle in einer Tabellenkarte. Jede Zeile zeigt die Stammdaten der Person sowie die Zeilenaktionen Bearbeiten und Löschen (siehe F4 S1, F5 S1) und die Reorder-Elemente (siehe F6).

## Akzeptanzkriterien
### Inhalt
- Die Tabelle zeigt eine Zeile pro persistierter Person.
- Die Tabelle enthält die Spalten „Reihenfolge", „ID", „Name", „Alter" und die Spalte für die Zeilenaktionen.
- Die Spalte „ID" zeigt die `Id` im Format `#{id}`.
- Die Spalte „Name" zeigt den `Name` der Person.
- Die Spalte „Alter" zeigt den `Age`-Wert der Person.
- Die Spalte „Alter" ist rechtsbündig ausgerichtet.

### Sortierung
- Das Backend liefert die Personen nach `Order` aufsteigend.
- Bei gleichem `Order`-Wert liefert das Backend die Personen nach `Name` sortiert.
- Die Tabelle zeigt die Personen in der vom Backend gelieferten Reihenfolge.
