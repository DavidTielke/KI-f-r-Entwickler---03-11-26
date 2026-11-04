# Unterlagen der Themenbereiche

## Meta
- **State:** Implemented

## User Story
Als Fachbereich möchte ich die Unterlagen eines Themenbereichs lesen, damit ich Datenmodell, Menü und Schnittstellen im Zusammenhang nachschlagen kann.

## Description
Beim aufgeklappten Themenbereich stehen dessen Unterlagen wie Datenstruktur, Menüstruktur und Backend. Ein Klick zeigt sie lesbar aufbereitet in einem Dialog. Unterlagen lassen sich hier nicht ändern.

## Akzeptanzkriterien
- Beim aufgeklappten Themenbereich steht die Gruppe „Unterlagen“.
- Die Gruppe „Unterlagen“ ist nur sichtbar, wenn der Themenbereich mindestens eine Unterlage hat.
- Das Backend erkennt Unterlagen an den Dateien `_{Name}.md` direkt im Ordner des Themenbereichs.
- Eine Unterlage erscheint unter ihrem Namen ohne führenden Unterstrich und ohne Dateiendung.
- Ein Klick auf eine Unterlage öffnet einen modalen Dialog.
- Der Dialog zeigt den Namen des Themenbereichs als Dachzeile.
- Der Dialog zeigt den Namen der Unterlage als Titel.
- Der Dialog stellt Überschriften der Ebenen 2 und 3 als Zwischenüberschriften dar.
- Der Dialog blendet die Überschrift der Ebene 1 aus.
- Der Dialog stellt Markdown-Tabellen als Tabellen dar.
- Der Dialog stellt Listen als Listen dar.
- Der Dialog stellt Codeblöcke als vorformatierten Text dar.
- Der Dialog bietet keine Bearbeitung an.
- Das Backend antwortet bei einer unbekannten Unterlage mit `404` und „Diese Unterlage existiert nicht.“.
- Das UI zeigt die Fehlermeldung im Dialog an.
