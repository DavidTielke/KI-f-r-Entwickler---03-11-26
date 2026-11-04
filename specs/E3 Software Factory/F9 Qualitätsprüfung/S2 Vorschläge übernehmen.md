# Vorschläge übernehmen

## Meta
- **State:** Implemented

## User Story
Als Fachbereich möchte ich Verbesserungsvorschläge der Qualitätsprüfung mit einem Klick übernehmen, damit ich Kriterien nicht selbst umformulieren muss.

## Description
Jeder Befund bietet eine Schaltfläche, die das bemängelte Kriterium durch die vorgeschlagenen Formulierungen ersetzt. Wo die Übernahme wirkt, hängt vom Ort der Prüfung ab.

## Akzeptanzkriterien
### Übernahme
- Ein Befund zeigt den Button „Vorschlag übernehmen“.
- Die Übernahme ersetzt das Kriterium mit exakt dem Text aus `criterion` durch alle Einträge aus `suggestions`.
- Die übrigen Kriterien bleiben unverändert.
- Der übernommene Befund verschwindet aus dem Ergebnis.

### Im Formular
- Im Anforderungs-Formular wirkt die Übernahme zunächst nur im Formular.
- Im Anforderungs-Formular wird die Übernahme erst mit dem Speichern des Formulars persistiert.

### Im Entwurf
- Im Entwurf des Assistenten wird die Übernahme sofort im Entwurf persistiert.

### Auf der Detailseite
- Auf der Detailseite ist der Button „Vorschlag übernehmen“ nur bei einer änderbaren Anforderung sichtbar (siehe F7 S3).
- Auf der Detailseite wird die Übernahme sofort in der Anforderung persistiert.
- Die Übernahme auf der Detailseite setzt den Status auf `Modified`.
- Die Übernahme auf der Detailseite erzeugt die Git-Version `anforderung: {id} geändert`.
- Bei der Übernahme auf der Detailseite wird das Event `requirement` mit dem Titel „Anforderung {id} »{Titel}« geändert“ ausgelöst.
- Das UI zeigt eine Fehlermeldung des Backends auf der Detailseite an.
