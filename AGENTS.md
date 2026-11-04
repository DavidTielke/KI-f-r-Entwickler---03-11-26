# Dev Harness
Diese Dateien IMMER lesen, wenn du etwas an bestimmten Teilen der Anwendung machst
- /harness/_uiux.md - IMMER lesen, wenn du irgendwas am UI oder dem UX machst.
- /harness/_uitests.md - IMMER lesen, wenn du UI-Tests (Playwright, End-to-End) in tests/ui/ schreibst, änderst oder ausführst.
- /harness/_requirements.md - IMMER lesen, wenn du in specs/ arbeitest (Epics, Features, Stories, Akzeptanzkriterien).
- /harness/_ideas.md - IMMER lesen, wenn ein Ideen-Dialog gestartet wird (der Stakeholder will eine neue Feature-Idee besprechen) oder in ideas/ gearbeitet wird.

# Dev Workflow
1. Code schreiben
2. IMMER wenn der Code geändert wird, zieh AUF JEDEN FALL UNBEDINGT die entsprechenden Specs nach ODER erstell neue dazu
3. git commit machen
4. docker compose up machen

# Test-Regeln
- Für das Epic E3 „Software Factory" (`specs/E3 Software Factory/`) werden **nie** Tests geschrieben — weder UI-Tests noch andere Testarten. Dies gilt dauerhaft, auch wenn dort neue Stories oder Kriterien entstehen.