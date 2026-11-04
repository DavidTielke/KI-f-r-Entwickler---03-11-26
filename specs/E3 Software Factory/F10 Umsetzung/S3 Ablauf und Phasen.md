# Ablauf und Phasen

## Meta
- **State:** Implemented

## User Story
Als Fachbereich möchte ich sehen, in welcher Phase ein Umsetzungs-Auftrag steht und was dort geprüft wird, damit ich dem Ergebnis vertrauen kann.

## Description
Eine Umsetzung durchläuft sechs Phasen. Die KI arbeitet nur in der Phase „Umsetzung“ und bei Nachbesserungen. Prüfen, Sichern und Ausliefern übernimmt der Factory-Dienst selbst.

## Akzeptanzkriterien
### Anzeige
- Die Seite ist unter `#/umsetzung/{id}` erreichbar.
- Die Seite zeigt die Dachzeile „{Art} {id}“.
- Die Seite zeigt den Titel des Auftrags.
- Die Schaltfläche „Zurück“ führt zu `#/umsetzung`.
- Die Seite zeigt den Status des Auftrags als Marke.
- Bei einer unbekannten Kennung zeigt das UI „Dieser Auftrag existiert nicht.“.
- Die Phasen erscheinen in der Reihenfolge „Vorbereitung“, „Umsetzung“, „Prüfung“, „Sicherung“, „Auslieferung“ und „Betriebsprüfung“.
- Eine abgeschlossene Phase zeigt ein Häkchen.
- Eine gescheiterte Phase zeigt ein Kreuz.
- Die übrigen Phasen zeigen ihre Nummer.
- Die Kennzahl „Laufzeit“ zählt während des Laufs sekündlich weiter.
- Die Kennzahl „Laufzeit“ entspricht dem Format `{s} Sek.`, `{m} Min. {ss} Sek.` oder `{h} Std. {mm} Min.`.
- Beim Auftragstyp `delivery` zeigt die Kennzahl „Anforderungen“ den Stand im Format `{k} von {n}`.
- Bei vorhandenem `changes` zeigt die Kennzahl „Änderungen“ die Anzahl der geänderten Dateien.
- Ohne `changes` zeigt die Kennzahl „Änderungen“ die Anzahl der ändernden Arbeitsschritte im Protokoll.
- Die Kennzahl „Version“ ist sichtbar, sobald eine Git-Version gesichert ist.

### Auftragsumfang
- Die Karte zeigt die Dachzeile „Auftragsumfang“.
- Die Karte zeigt den Titel „Anforderungen.“.
- Ein Eintrag zeigt den Titel der Anforderung als Verweis auf `#/anforderungen/{id}`.
- Ein Eintrag zeigt die Nummer der Anforderung.
- Ein Eintrag zeigt die Notiz der KI aus `note`, sobald sie vorliegt.
- Eine Anforderung mit `done` trägt ein Häkchen.
- Eine nicht fertige Anforderung zeigt während des Laufs „In Arbeit“.
- Das Backend gleicht `done` während der Phase „Umsetzung“ alle 3 Sekunden mit dem Status in der Datei ab.

### Vorbereitung
- Liegen in `code` außerhalb von `code/factory`, in `specs` oder in `docker-compose.yml` nicht gesicherte Änderungen, endet der Auftrag mit „Im Arbeitsstand liegen nicht gesicherte Änderungen. Bitte sichern oder verwerfen Sie diese, bevor eine Umsetzung startet.“.
- Ist Docker nicht erreichbar, endet der Auftrag mit „Die Betriebsumgebung ist nicht erreichbar. Bitte starten Sie Docker Desktop.“.
- Das Backend merkt sich den Ausgangsstand im Feld `baseCommit`.
- Das Backend merkt sich, welche Dateien außerhalb des erlaubten Bereichs bereits geändert sind.

### Umsetzung
- Die KI arbeitet mit dem Rechteprofil `build`.
- Die KI arbeitet mit dem Modell aus `buildModel`.
- Die KI arbeitet mit der Arbeitstiefe `high`.
- Die Phase endet spätestens nach 90 Minuten.
- Die KI stellt keine Rückfragen.
- Die KI erhält die Vorgabe, `AGENTS.md`, `harness/_requirements.md` und bei Oberflächen-Änderungen `harness/_uiux.md` zu lesen.
- Die KI erhält die Vorgabe, die Unterlagen unter `specs/` nachzuziehen.
- Die KI erhält die Vorgabe, eine vollständig umgesetzte Anforderung sofort auf `Implemented` zu setzen.
- Die KI erhält die Vorgabe, Befehle nur mit dem Werkzeug Bash und nur mit `npm`, `npx` und `dotnet` auszuführen.
- Die KI erhält die Vorgabe, ihre Arbeit mit `npm --prefix code/frontend run build` und `dotnet build code/backend` zu prüfen.
- Die KI meldet in `summary` zwei bis vier Sätze in Fachsprache.
- Die KI meldet in `stories` je Anforderung `id`, `done` und `note`.

### Prüfung
- Als erlaubter Bereich gelten `code` ohne `code/factory`, `specs`, `ideas` und `docker-compose.yml`.
- Sind seit dem Start weitere Dateien außerhalb des erlaubten Bereichs geändert, endet der Auftrag mit „Die KI hat Dateien außerhalb des erlaubten Bereichs verändert.“.
- Das Backend baut die neue Version mit `docker compose build`.
- Scheitert der Bau, greift die Nachbesserung (siehe S10).
- Meldet die KI eine Anforderung als fertig, setzt das Backend deren Status auf `Implemented`.
- Meldet die KI eine Anforderung als nicht fertig, setzt das Backend deren Status auf `Modified`.

### Sicherung
- Das Backend sichert alle Änderungen in `code` außerhalb von `code/factory`, in `specs` und in `docker-compose.yml` als Git-Version.
- Der Betreff entspricht dem Format `umsetzung: {Kennungen}` mit den fertigen Anforderungen.
- Ohne fertige Anforderung entspricht der Betreff dem Format `umsetzung: {id} teilweise, keine anforderung abgeschlossen`.
- Der Text der Git-Version enthält `summary`.
- Ohne Änderung entsteht keine Git-Version.

### Auslieferung und Betriebsprüfung
- Das Backend liefert die neue Version mit `docker compose up -d --build` aus.
- Das Backend fragt jede Adresse aus `healthPaths` unter `appUrl` ab.
- Die Prüfung gilt als bestanden, wenn in einem Durchgang alle Adressen erfolgreich antworten.
- Das Backend wiederholt die Prüfung alle 2,5 Sekunden.
- Eine einzelne Abfrage wartet höchstens 5 Sekunden.
- Bleibt die Prüfung 90 Sekunden lang erfolglos, lautet der Befund „Die Anwendung antwortet nach der Auslieferung nicht fehlerfrei.“.
- Bei diesem Befund liest das Backend die letzten 120 Zeilen von `docker compose logs`.
- Das Protokoll zeigt dafür den Schritt „Liest das Betriebsprotokoll“.
- Das Backend hängt diese Zeilen an die technischen Details des Befunds an.
- Scheitert die Auslieferung oder die Betriebsprüfung, greift die Nachbesserung (siehe S10).

### Abschluss
- Sind alle Anforderungen fertig, erhält der Auftrag den Status `done`.
- Ist mindestens eine Anforderung nicht fertig, erhält der Auftrag den Status `partial`.
- Beim Abschluss wird das Event `delivery` mit dem Titel „Umsetzung {id} ausgeliefert ({k} von {n} Anforderungen)“ ausgelöst.
