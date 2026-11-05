# Entwicklerdokumentation

## Meta
- **Stand:** 2026-11-04
- **Bezug:** code/backend, code/frontend, code/factory, harness/analyse_*.py, docker-compose.yml

Wegweiser durch die technische Dokumentation. Sie richtet sich an Entwickler, die neu ins Projekt kommen. Fachliche Anforderungen stehen in `specs/`, die Regeln für diese Dokumente in [`harness/_devdocs.md`](../../harness/_devdocs.md).

## Das System in Kürze

Das Projekt besteht aus drei Teilen: der Personen- und Haustierverwaltung (React-Frontend, ASP.NET-Core-Backend, SQLite), der Software Factory (eigener Node-Server mit React-Oberfläche, Epic E3) und den Qualitätsanalyse-Skripten (Epic E4). Details stehen in der [Systemarchitektur](01%20Systemarchitektur.md).

## Dokumente

| Dokument | Zweck |
|---|---|
| [01 Systemarchitektur](01%20Systemarchitektur.md) | Kontext, Deployment, Querschnittsthemen und technische Entscheidungen |
| [02 Bausteine](02%20Bausteine.md) | Bausteine je Container und ihre Abhängigkeiten |
| [03 API](03%20API.md) | HTTP-Schnittstelle des App-Backends und der Factory: Endpunkte, Payloads, Fehlerformat |
| [04 Designregeln](04%20Designregeln.md) | Ist-Regeln für Code, Frontend-Konventionen und bewusste Abweichungen von den Harness-Vorgaben |

## Geschäftsprozesse

| Dokument | Zweck |
|---|---|
| [GP1 Person anlegen](05%20Geschaeftsprozesse/GP1%20Person%20anlegen.md) | Anlegen inkl. Tier-Zuordnung und Fehlerfällen |
| [GP2 Person bearbeiten](05%20Geschaeftsprozesse/GP2%20Person%20bearbeiten.md) | Bearbeiten im Dialog |
| [GP3 Person löschen](05%20Geschaeftsprozesse/GP3%20Person%20l%C3%B6schen.md) | Löschen mit Bestätigung und Folgen für Haustiere |
| [GP4 Reihenfolge verwalten](05%20Geschaeftsprozesse/GP4%20Reihenfolge%20verwalten.md) | Verschieben mit Optimistic Update und Rollback |
| [GP5 Haustier verwalten](05%20Geschaeftsprozesse/GP5%20Haustier%20verwalten.md) | Haustiere anlegen, bearbeiten, löschen |
| [GP6 Idee erfassen und verfeinern](05%20Geschaeftsprozesse/GP6%20Idee%20erfassen%20und%20verfeinern.md) | Ideen-Tafel und Ideen-Dialog der Factory |
| [GP7 Idee in Anforderungen überführen](05%20Geschaeftsprozesse/GP7%20Idee%20in%20Anforderungen%20%C3%BCberf%C3%BChren.md) | Überführung einer Idee nach `specs/` |
| [GP8 Anforderung formulieren und prüfen](05%20Geschaeftsprozesse/GP8%20Anforderung%20formulieren%20und%20pr%C3%BCfen.md) | Anforderungen pflegen, Assistent, Qualitätsprüfung |
| [GP9 Umsetzung beauftragen und ausliefern](05%20Geschaeftsprozesse/GP9%20Umsetzung%20beauftragen%20und%20ausliefern.md) | Auftrag, Warteschlange, Phasen, Ergebnis |
| [GP10 Auftrag abbrechen und Auslieferung zurücknehmen](05%20Geschaeftsprozesse/GP10%20Auftrag%20abbrechen%20und%20Auslieferung%20zur%C3%BCcknehmen.md) | Abbrechen, Verwerfen, Zurücknehmen, erneut beauftragen |
| [GP11 Qualitätsanalyse ausführen](05%20Geschaeftsprozesse/GP11%20Qualit%C3%A4tsanalyse%20ausf%C3%BChren.md) | Code-, Design- und Gesamtanalyse |

## Abgrenzung

- Visuelles Design: [`harness/_uiux.md`](../../harness/_uiux.md)
- Backend-Architekturvorgaben: [`harness/_design.md`](../../harness/_design.md)
- C#-Codestil: [`harness/_code.md`](../../harness/_code.md)
- Anforderungen: `specs/`, Anwenderdokumentation: `docs/user/`
