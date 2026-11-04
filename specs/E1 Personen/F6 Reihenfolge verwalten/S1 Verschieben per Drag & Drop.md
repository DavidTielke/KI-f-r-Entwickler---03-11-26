# Verschieben per Drag & Drop

## Meta
- **State:** Implemented

## User Story
Als Administration möchte ich Zeilen per Ziehen in eine neue Reihenfolge bringen, damit ich die Anzeigereihenfolge frei steuern kann.

## Description
In der Spalte „Reihenfolge" trägt jede Zeile einen Ziehgrip. Über den Grip lässt sich die Zeile auf eine andere Position ziehen; während des Ziehens verschieben sich die übrigen Zeilen live, nach dem Loslassen wird die Reihenfolge gespeichert.

## Akzeptanzkriterien
- Wenn eine Person verschoben wird, dann soll dem Cursor ein bunter Partikelregen folgen
- Jede Zeile zeigt in der Spalte „Reihenfolge" einen Ziehgrip.
- Die Zeile ist nur über den Ziehgrip ziehbar.
- Die gezogene Zeile wird während des Ziehens visuell als gezogen markiert.
- Beim Überfahren einer anderen Zeile weichen die übrigen Zeilen live aus (Live-Vorschau der neuen Reihenfolge).
- Nach dem Loslassen wird die aktuelle Zeilenreihenfolge an das Backend übertragen (siehe F6 S4).
- Nach dem Loslassen ohne Positionswechsel bleibt die Reihenfolge unverändert.
