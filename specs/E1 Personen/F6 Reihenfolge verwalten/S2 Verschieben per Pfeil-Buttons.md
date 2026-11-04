# Verschieben per Pfeil-Buttons

## Meta
- **State:** Implemented

## User Story
Als Administration möchte ich eine Zeile per Klick eine Position nach oben oder unten verschieben, damit ich die Reihenfolge ohne Ziehen präzise anpassen kann.

## Description
In der Spalte „Reihenfolge" trägt jede Zeile zwei Pfeil-Buttons. Ein Klick tauscht die Zeile mit der Nachbarzeile und überträgt die neue Reihenfolge sofort an das Backend.

## Akzeptanzkriterien
- Jede Zeile zeigt einen Pfeil-Button „nach oben" und einen Pfeil-Button „nach unten".
- Der Pfeil-Button „nach oben" ist bei der obersten Zeile deaktiviert.
- Der Pfeil-Button „nach unten" ist bei der untersten Zeile deaktiviert.
- „nach oben" tauscht die Zeile mit der vorherigen Zeile.
- „nach unten" tauscht die Zeile mit der nächsten Zeile.
- Nach dem Tausch wird die neue Reihenfolge sofort an das Backend übertragen (siehe F6 S4).
