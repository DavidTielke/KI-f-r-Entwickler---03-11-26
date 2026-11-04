# Auswahl und Beauftragung

## Meta
- **State:** Implemented

## User Story
Als Fachbereich möchte ich offene Anforderungen auswählen und ihre Umsetzung beauftragen, damit die KI sie vollständig umsetzt und ausliefert.

## Description
Offene Anforderungen lassen sich in der Liste oder auf der Detailseite auswählen. Die Auswahl bleibt beim Wechsel zwischen den Seiten erhalten. Vor dem Start erklärt ein Dialog den Umfang und den Ablauf.

## Akzeptanzkriterien
### Auswahl in der Liste
- Eine Zeile einer offenen Anforderung zeigt ein Auswahlfeld.
- Eine Zeile einer umgesetzten Anforderung zeigt kein Auswahlfeld.
- Eine Zeile eines Werkzeug-Themenbereichs zeigt kein Auswahlfeld.
- Ein Klick auf ein Auswahlfeld öffnet nicht die Detailseite.
- Das Auswahlfeld im Tabellenkopf trägt die Bezeichnung „Alle offenen Anforderungen auswählen“.
- Das Auswahlfeld im Tabellenkopf wählt alle aktuell sichtbaren offenen Anforderungen aus.
- Sind alle aktuell sichtbaren offenen Anforderungen ausgewählt, hebt das Auswahlfeld im Tabellenkopf ihre Auswahl auf.
- Das Auswahlfeld im Tabellenkopf ist deaktiviert, wenn keine auswählbare Anforderung sichtbar ist.

### Auswahl auf der Detailseite
- Bei einer offenen Anforderung außerhalb der Werkzeug-Themenbereiche ist der Button „Zur Auswahl hinzufügen“ sichtbar.
- Bei einer bereits ausgewählten Anforderung heißt der Button „Aus der Auswahl entfernen“.

### Auswahlleiste
- Die Seite „Anforderungen“ zeigt bei mindestens einer ausgewählten Anforderung eine Auswahlleiste.
- Die Auswahlleiste nennt „{n} Anforderung ausgewählt“ beziehungsweise „{n} Anforderungen ausgewählt“.
- Der Button „Auswahl aufheben“ leert die Auswahl.
- Der Button „Umsetzung starten“ öffnet den Dialog zur Beauftragung.
- Die Auswahl bleibt beim Wechsel zwischen den Seiten erhalten.
- Die Auswahl geht beim Neuladen der Oberfläche verloren.

### Dialog
- Der Button „Umsetzung starten“ auf der Detailseite öffnet den Dialog mit genau dieser Anforderung.
- Der Dialog zeigt die Dachzeile „Umsetzung“.
- Der Dialog zeigt den Titel „Umsetzung beauftragen.“.
- Der Dialog zeigt „1 Anforderung wird vollständig umgesetzt und ausgeliefert.“ beziehungsweise „{n} Anforderungen werden vollständig umgesetzt und ausgeliefert.“.
- Der Dialog listet Nummer und Titel jeder Anforderung auf.
- Der Abschnitt „So läuft es ab“ nennt „Die KI liest die Anforderungen und passt die Anwendung an.“.
- Der Abschnitt „So läuft es ab“ nennt „Die neue Version wird gebaut und geprüft. Fehler bessert die KI selbstständig nach.“.
- Der Abschnitt „So läuft es ab“ nennt „Der neue Stand wird als Version gesichert und ausgeliefert.“.
- Der Abschnitt „So läuft es ab“ nennt „Die Factory prüft, ob die Anwendung im Betrieb antwortet.“.
- Der Dialog enthält den Button „Abbrechen“.
- Der Dialog enthält den Button „Umsetzung starten“.

### Beauftragung
- Das Backend nimmt die Kennungen im Feld `storyIds` entgegen.
- Das Backend antwortet mit `202` und der Kennung des neuen Auftrags.
- Der neue Auftrag hat den Typ `delivery`.
- Bei genau einer Anforderung trägt der Auftrag deren Titel.
- Bei mehreren Anforderungen trägt der Auftrag den Titel „{n} Anforderungen“.
- Bei der Beauftragung wird das Event `run` mit dem Titel „Umsetzung {id} beauftragt ({n} Anforderungen)“ ausgelöst.
- Das UI leert nach dem Start die gesamte Auswahl.
- Das UI wechselt nach dem Start zu `#/umsetzung/{id}`.
- Das Backend antwortet ohne Kennung mit `409` und „Bitte wählen Sie mindestens eine Anforderung aus.“.
- Das Backend antwortet bei einer umgesetzten Anforderung mit `409` und „Die Anforderung {id} ist bereits umgesetzt.“.
- Das Backend antwortet bei einem Werkzeug-Themenbereich mit `409` und „Der Themenbereich „Software Factory“ lässt sich nicht über die Factory selbst umsetzen.“.
- Das Backend antwortet bei einer bereits wartenden oder laufenden Anforderung mit `409` und „Die Anforderung {id} ist bereits beauftragt.“.
- Das UI zeigt die Fehlermeldung des Backends im Dialog an.
