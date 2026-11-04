# Software Factory

Oberfläche für den Weg von der Idee bis zur ausgelieferten Funktion. Sie arbeitet direkt auf den Dateien in `ideas/` und `specs/` und nach den Regeln aus `harness/`. Die fachliche Beschreibung steht in `specs/E3 Software Factory`.

## Starten

Doppelklick auf `SoftwareFactory.cmd` im Repository-Hauptordner, danach läuft die Factory auf http://localhost:4000.

Von Hand: `npm install`, `npm run build`, `npm start`. Entwicklung der Oberfläche: `npm start` und `npm run dev` (Port 5174). Tests: `npm test`.

## Voraussetzungen

- `claude` ist installiert und angemeldet. Die Factory steuert darüber die KI.
- `git` und Docker Desktop laufen. Die Factory sichert und liefert selbst aus.
- Für Sprache: Chrome oder Edge. Die Spracherkennung läuft über den Cloud-Dienst des Browser-Herstellers.

## Warum kein Container

Die Factory nutzt `claude`, `git` und `docker` dieses Rechners mit dem Login des Anwenders. Deshalb läuft sie als lokaler Dienst und ist nur über `127.0.0.1` erreichbar. Eine Anmeldung gibt es nicht. Für einen Betrieb auf einem Server wären Anmeldung und Rechteverwaltung nötig.

## Aufbau

- `server/`: Dienst auf Node.js. Liest und schreibt die Dateien, steuert die KI (`agent.js`), führt Gespräche (`sessions.js`) und Aufträge (`runs.js`).
- `src/`: Oberfläche in React. Sprachein- und -ausgabe liegen in `src/lib/voice.js`.
- `data/`: Gesprächsverläufe, Auftragsprotokolle, Einstellungen. Nicht versioniert.

## Testbetrieb gegen eine Kopie

Alle Pfade lassen sich umlenken, sodass der echte Stand unberührt bleibt: `FACTORY_REPO`, `FACTORY_DATA`, `FACTORY_PORT`, `FACTORY_APP_URL`.
