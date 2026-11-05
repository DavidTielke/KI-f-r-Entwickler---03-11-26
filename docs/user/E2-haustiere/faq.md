# Häufige Fragen zu Haustieren

### Warum kann ich ein Haustier nicht speichern?
Prüfen Sie zuerst die roten Meldungen unter den Feldern. „Name ist erforderlich." heißt, dass das Feld **Name** leer ist. „Spezies ist erforderlich." heißt, dass noch „Bitte wählen" im Feld **Spezies** steht. Füllen Sie das Feld aus und klicken Sie erneut auf **Anlegen** oder **Speichern**. Die Schritte stehen unter [Haustier anlegen](02-haustier-anlegen.md).

### Warum kann ich eine Person nicht auswählen?
Diese Person hat schon ein anderes Tier und steht grau in der Auswahl **Person**. Jede Person hat höchstens ein Tier. Wählen Sie eine andere Person oder lösen Sie zuerst die Zuordnung beim anderen Tier. Siehe [Haustier bearbeiten](03-haustier-bearbeiten.md) und das [Modul Personen](../E1-personen/README.md).

### Was bedeutet die Meldung „HTTP 400"?
Die Anwendung hat das Tier nicht gespeichert, zum Beispiel weil die gewählte Person inzwischen ein anderes Tier hat. Das Fenster bleibt offen, Ihre Eingaben bleiben erhalten. Wählen Sie eine andere Person oder **Keine Person** und speichern Sie erneut. Siehe [Haustier anlegen](02-haustier-anlegen.md).

### Was bedeutet die Meldung „Not Found"?
Das Tier gibt es nicht mehr, weil es inzwischen gelöscht wurde. Schließen Sie das Fenster mit **Abbrechen** und prüfen Sie die Liste. Siehe [Haustier bearbeiten](03-haustier-bearbeiten.md) und [Haustier löschen](04-haustier-loeschen.md).

### Was bedeutet eine Meldung wie „HTTP 500" über der Tabelle?
Die Anwendung konnte die Liste nicht laden oder eine Aktion nicht ausführen. Die Zahl nennt den Fehlercode. Laden Sie die Seite neu und versuchen Sie es noch einmal. Bleibt die Meldung, wenden Sie sich an Ihre Administration. Siehe [Haustierliste](01-haustierliste.md).

### Warum steht in der Liste „Wird geladen …"?
Die Anwendung holt gerade die Tiere. Nach einem Moment erscheint dort die Anzahl, zum Beispiel „3 Haustiere". Bleibt der Hinweis stehen, laden Sie die Seite neu. Siehe [Haustierliste](01-haustierliste.md).

### Warum sehe ich „Noch keine Haustiere."?
Es ist noch kein Tier gespeichert. Klicken Sie oben rechts auf **Anlegen** und erfassen Sie das erste Tier. Siehe [Haustier anlegen](02-haustier-anlegen.md).

### Was passiert mit der Person, wenn ich ihr Haustier lösche?
Nichts. Die Person bleibt in der Personenliste erhalten und hat danach kein Tier mehr. Sie können ihr ein neues Tier zuordnen. Siehe [Haustier löschen](04-haustier-loeschen.md).

### Kann ich ein gelöschtes Haustier zurückholen?
Nein. Das Löschen ist endgültig. Legen Sie das Tier bei Bedarf neu an. Siehe [Haustier löschen](04-haustier-loeschen.md).

### Wie schließe ich ein Fenster, ohne zu speichern?
Klicken Sie auf **Abbrechen**, auf das Kreuz oben rechts oder drücken Sie die Taste Esc. Auch ein Klick auf den abgedunkelten Hintergrund schließt das Fenster. Siehe [Dialoge schließen](05-dialoge-schliessen.md).
