# Animation und Hervorhebung

## Meta
- **State:** Implemented

## User Story
Als Administration möchte ich bei einem Verschieben eine kurze Animation und Hervorhebung sehen, damit die neue Position klar erkennbar ist.

## Description
Verschiebungen per Pfeil-Button gleiten die betroffenen Zeilen in ihre neue Position; nach jedem Verschieben (Pfeil oder Drag) wird die verschobene Zeile kurz hervorgehoben.

## Akzeptanzkriterien
- Nach einem Verschieben per Pfeil-Button gleiten die betroffenen Zeilen in ca. 220 ms in ihre neue Position.
- Während eines aktiven Drag & Drops werden keine Verschiebungs-Animationen ausgeführt.
- Nach einem Verschieben per Pfeil-Button wird die verschobene Zeile kurz hervorgehoben.
- Nach einem Drag & Drop wird die gezogene Zeile kurz hervorgehoben.
- Die Hervorhebung endet automatisch.
