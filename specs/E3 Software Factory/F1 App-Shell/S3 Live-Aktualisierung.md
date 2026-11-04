# Live-Aktualisierung

## Meta
- **State:** Implemented

## User Story
Als Fachbereich möchte ich, dass sich geöffnete Ansichten von selbst aktualisieren, damit ich den Fortschritt der KI verfolgen kann, ohne die Seite neu zu laden.

## Description
Der Dienst meldet jede Änderung über einen Live-Kanal an alle geöffneten Oberflächen. Jede Ansicht lädt daraufhin nur die Daten nach, die sie betreffen. Auch Änderungen an den Dateien von außerhalb der Factory erscheinen sofort.

## Akzeptanzkriterien
### Live-Kanal
- Die Oberfläche hält für alle Ansichten genau eine Verbindung zu `GET /api/events`.
- Das Backend sendet bei einer Änderung eine Meldung mit den Feldern `topic` und `id`.
- Das Feld `topic` enthält einen der Werte `ideas`, `requirements`, `runs`, `studio` oder `settings`.
- Das Backend sendet alle 25 Sekunden ein Lebenszeichen auf die offene Verbindung.
- Das Backend legt für die Wiederverbindung des Browsers einen Abstand von 2 Sekunden fest.

### Nachladen
- Eine Ansicht lädt ihre Daten neu, sobald eine Meldung zu einem ihrer Themen eintrifft.
- Mehrere Meldungen innerhalb von 200 Millisekunden lösen nur ein Neuladen aus.
- Schlägt das Neuladen fehl, bleiben die zuletzt geladenen Daten sichtbar.
- Schlägt das Laden fehl, zeigt das UI die Fehlermeldung des Backends an.
- Ist der Dienst nicht erreichbar, lautet die Fehlermeldung „Der Factory-Dienst ist nicht erreichbar.“.
- Liefert das Backend keine eigene Fehlermeldung, lautet sie „Die Anfrage ist fehlgeschlagen.“.

### Dateiänderungen
- Eine Änderung unter `specs/` löst die Meldung `requirements` aus, auch wenn sie außerhalb der Factory entsteht.
- Eine Änderung unter `ideas/` löst die Meldung `ideas` aus, auch wenn sie außerhalb der Factory entsteht.
- Das Backend fasst Dateiänderungen innerhalb von 300 Millisekunden zu einer Meldung zusammen.
