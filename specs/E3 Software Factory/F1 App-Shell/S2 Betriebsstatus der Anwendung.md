# Betriebsstatus der Anwendung

## Meta
- **State:** Implemented

## User Story
Als Fachbereich möchte ich in der Seitenleiste sehen, ob die ausgelieferte Anwendung erreichbar ist, damit ich Störungen bemerke und die Anwendung direkt öffnen kann.

## Description
Unterhalb der Navigation zeigt ein kleiner Statusbereich, ob die Anwendung antwortet. Ein Klick darauf öffnet die Anwendung in einem neuen Tab.

## Akzeptanzkriterien
- Der Statusbereich zeigt die Beschriftung „Anwendung“.
- Der Statusbereich ist erst sichtbar, sobald das Backend den Systemzustand geliefert hat.
- Antwortet die Anwendung erfolgreich, steht dort „In Betrieb“.
- Antwortet die Anwendung nicht erfolgreich, steht dort „Nicht erreichbar“.
- Die Punkt-Markierung unterscheidet sich zwischen „In Betrieb“ und „Nicht erreichbar“.
- Das Backend prüft die Erreichbarkeit mit einer Anfrage an `appUrl`.
- Bleibt die Antwort 3 Sekunden aus, gilt die Anwendung als nicht erreichbar.
- Eine Antwort mit einem Fehlerstatus gilt als nicht erreichbar.
- Ein Klick auf den Statusbereich öffnet `appUrl` in einem neuen Browser-Tab.
- Das UI ermittelt den Status beim Laden der Oberfläche.
- Das UI ermittelt den Status alle 30 Sekunden neu.
- Das UI ermittelt den Status nicht in festen Zeitabständen.
