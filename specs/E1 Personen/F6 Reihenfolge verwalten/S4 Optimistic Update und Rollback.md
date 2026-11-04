# Optimistic Update und Rollback

## Meta
- **State:** Implemented

## User Story
Als Administration möchte ich die neue Reihenfolge sofort im Bildschirm sehen, ohne auf die Antwort des Backends zu warten.

## Description
Das Frontend passt die lokale Zeilenreihenfolge vor der Backend-Antwort an und sendet die komplette ID-Liste an den Reorder-Endpunkt. Bei einem Fehler wird der Zustand aus dem Backend neu geladen und die Fehlermeldung angezeigt.

## Akzeptanzkriterien
- Das Frontend passt die lokale Zeilenreihenfolge vor der Backend-Antwort an.
- Das Frontend sendet eine `PATCH /api/persons/reorder`-Anfrage mit der vollständigen ID-Liste in der neuen Reihenfolge.
- Bei einem Fehler des Reorder-Endpunkts lädt das Frontend die Personenliste neu.
- Bei einem Fehler des Reorder-Endpunkts zeigt die Seite die Fehlermeldung des Backends an (siehe F2 S4).
