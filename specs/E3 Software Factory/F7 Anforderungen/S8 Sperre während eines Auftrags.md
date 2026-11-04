# Sperre während eines Auftrags

## Meta
- **State:** Implemented

## User Story
Als Fachbereich möchte ich klar erkennen, dass Anforderungen während eines laufenden Auftrags gesperrt sind, damit meine Änderungen nicht mit der Arbeit der KI kollidieren.

## Description
Ein Auftrag ändert den gemeinsamen Arbeitsstand. Solange einer läuft, nimmt die Factory keine Änderungen an Anforderungen an. Die Sperre endet mit dem Auftrag von selbst.

## Akzeptanzkriterien
### Backend
- Das Backend meldet im Feld `locked` von `GET /api/requirements`, ob ein Auftrag läuft.
- Während eines Auftrags antwortet `POST /api/requirements` mit `409`.
- Während eines Auftrags antwortet `PUT /api/requirements/{id}` mit `409`.
- Während eines Auftrags antwortet `DELETE /api/requirements/{id}` mit `409`.
- Während eines Auftrags antwortet `POST /api/studio/{id}/save` mit `409`.
- Die Fehlermeldung lautet „Während eines laufenden Auftrags lassen sich Anforderungen nicht ändern. Bitte warten Sie den Abschluss ab.“.
- Die Sperre endet, sobald der Auftrag beendet ist.

### Oberfläche
- Die Seite „Anforderungen“ zeigt während eines Auftrags „Ein Auftrag läuft gerade. Bis zu seinem Abschluss lassen sich Anforderungen nicht ändern.“.
- Der Hinweis enthält den Verweis „Fortschritt ansehen“ auf `#/umsetzung`.
- Auf der Detailseite sind während eines Auftrags die Buttons „Mit Assistent überarbeiten“, „Bearbeiten“ und „Umsetzung starten“ nicht sichtbar.
- Auf der Detailseite ist während eines Auftrags der Button „Anforderung entfernen“ deaktiviert.
- Auf der Detailseite ist während eines Auftrags der Button „Vorschlag übernehmen“ nicht sichtbar.
- Die Auswahl für die nächste Umsetzung bleibt während eines Auftrags möglich.
- Die Primäraktion „Anforderung anlegen“ bleibt während eines Auftrags aktiv.
