# Anforderungs-Detail

## Meta
- **State:** Implemented

## User Story
Als Fachbereich möchte ich alle Angaben zu einer Anforderung auf einer Seite sehen, damit ich ihren Inhalt, ihre Herkunft und ihre Umsetzung nachvollziehen kann.

## Description
Die Detailseite zeigt Nutzen, Beschreibung und Abnahmekriterien sowie Einordnung, Umsetzungen und Änderungsverlauf. Von hier aus lässt sich die Anforderung bearbeiten, prüfen, umsetzen oder entfernen.

## Akzeptanzkriterien
### Kopfbereich
- Die Seite ist unter `#/anforderungen/{id}` erreichbar.
- Die Seite zeigt die Dachzeile „Anforderung · {Nummer}“.
- Die Seite zeigt den Titel der Anforderung.
- Die Schaltfläche „Zurück“ führt zu `#/anforderungen`.
- Die Seite zeigt den Status als Marke „Umgesetzt“ oder „Umsetzung offen“.
- Der Button „Mit Assistent überarbeiten“ ist sichtbar, solange die Anforderung änderbar ist.
- Der Button „Bearbeiten“ ist sichtbar, solange die Anforderung änderbar ist.
- Der Button „Umsetzung starten“ ist nur bei einer offenen und änderbaren Anforderung sichtbar.
- Eine Anforderung gilt als änderbar, wenn sie nicht zu einem Werkzeug-Themenbereich gehört und kein Auftrag läuft.
- Bei einer unbekannten Kennung zeigt das UI „Diese Anforderung existiert nicht mehr.“.

### Inhalt
- Die Karte mit der Dachzeile „Nutzen“ zeigt das Feld `userStory`.
- Die Bezeichnung „Beschreibung“ mit dem Feld `description` ist nur sichtbar, wenn `description` Inhalt hat.
- Die Karte „Abnahmekriterien.“ zeigt die Dachzeile „{n} Kriterium“ beziehungsweise „{n} Kriterien“.
- Die Karte „Abnahmekriterien.“ zeigt die Kriterien nach ihren Themen gruppiert.
- Bei einer umgesetzten Anforderung trägt jedes Kriterium ein Häkchen.
- Bei einer offenen Anforderung trägt kein Kriterium ein Häkchen.
- Bei einer Anforderung aus einem Werkzeug-Themenbereich erscheint „Diese Anforderung beschreibt die Software Factory selbst. Sie wird über den regulären Entwicklungsprozess geändert, nicht über die Factory.“.

### Einordnung
- Die Karte zeigt die Dachzeile „Struktur“.
- Die Karte zeigt den Titel „Einordnung.“.
- Die Zeile „Themenbereich“ zeigt das Feld `epicName`.
- Die Zeile „Funktion“ zeigt das Feld `featureName`.
- Die Zeile „Herkunft“ zeigt die Herkunft (siehe F6 S3).

### Umsetzungen
- Die Karte zeigt die Dachzeile „Nachweis“.
- Die Karte zeigt den Titel „Umsetzungen.“.
- Die Karte listet alle Aufträge vom Typ `delivery`, die diese Anforderung enthalten.
- Ein Eintrag zeigt die Nummer und den Status des Auftrags.
- Ein Eintrag zeigt das Abschlussdatum.
- Ein Eintrag führt zu `#/umsetzung/{id}`.
- Ohne Auftrag steht dort „Noch nicht über die Software Factory umgesetzt.“.

### Änderungsverlauf
- Die Karte zeigt die Dachzeile „Versionen“.
- Die Karte zeigt den Titel „Änderungsverlauf.“.
- Das Backend liefert die letzten 15 Git-Versionen der Datei.
- Das Backend folgt dabei auch Umbenennungen der Datei.
- Ein Eintrag zeigt den Betreff der Version.
- Ein Eintrag zeigt das Datum der Version.
- Ein Eintrag zeigt die Kurzkennung der Version.
- Ohne Version steht dort „Noch keine gesicherte Version.“.
