# Häufige Fragen zum Modul Personen

### Wie lege ich eine neue Person an?
Klicken Sie oben rechts auf **Anlegen**. Tragen Sie Name und Alter ein und klicken Sie im Fenster auf **Anlegen**. Die Person erscheint am Ende der Liste. Ein Haustier können Sie gleich mit auswählen.
Ausführlich: [Eine Person anlegen](03-person-anlegen.md)

### Warum erscheint „Name ist erforderlich."?
Das Feld **Name** ist leer oder enthält nur Leerzeichen. Tragen Sie einen Namen ein und klicken Sie erneut auf **Anlegen** oder **Speichern**.
Ausführlich: [Eine Person anlegen](03-person-anlegen.md)

### Warum erscheint „Alter muss eine Zahl sein."?
Das Feld **Alter** ist leer oder enthält keine Zahl. Tragen Sie das Alter als Zahl ein, zum Beispiel 30.
Ausführlich: [Eine Person anlegen](03-person-anlegen.md)

### Warum erscheint „Alter muss zwischen 0 und 150 liegen."?
Die eingegebene Zahl ist kleiner als 0 oder größer als 150. Tragen Sie eine Zahl in diesem Bereich ein.
Ausführlich: [Eine Person anlegen](03-person-anlegen.md)

### Warum kann ich ein Haustier nicht auswählen?
Das Haustier ist grau, weil es schon einer anderen Person gehört. Ein Haustier gehört immer nur einer Person. Wählen Sie ein anderes Haustier oder lösen Sie die Zuordnung zuerst bei der anderen Person über **Kein Haustier**.
Ausführlich: [Eine Person bearbeiten](04-person-bearbeiten.md)

### Was bedeutet „HTTP 400" oder „HTTP 500"?
Die Anwendung hat eine Aktion nicht ausführen können. **HTTP 400** heißt: Die Eingabe wurde abgelehnt, oft weil das gewählte Haustier inzwischen einer anderen Person gehört. **HTTP 500** heißt: Es gab ein Problem beim Speichern oder Laden. Laden Sie die Seite neu und versuchen Sie es erneut. Bleibt die Meldung, wenden Sie sich an Ihre Administration.
Ausführlich: [Die Personenliste ansehen](02-personenliste.md)

### Was bedeutet „Not Found" im Bearbeiten-Fenster?
Die Person gibt es nicht mehr, zum Beispiel weil sie inzwischen gelöscht wurde. Schließen Sie das Fenster, laden Sie die Seite neu und prüfen Sie die Liste.
Ausführlich: [Eine Person bearbeiten](04-person-bearbeiten.md)

### Warum steht „Noch keine Personen." auf dem Bildschirm?
Es ist noch keine Person gespeichert, oder alle wurden gelöscht. Klicken Sie oben rechts auf **Anlegen**, um die erste Person einzutragen.
Ausführlich: [Die Personenliste ansehen](02-personenliste.md)

### Kann ich eine gelöschte Person zurückholen?
Nein. Das Löschen ist endgültig, deshalb fragt die Anwendung vorher nach. Legen Sie die Person bei Bedarf neu an. Sie erhält dann eine neue Nummer. Ein zugeordnetes Haustier bleibt beim Löschen erhalten.
Ausführlich: [Eine Person löschen](05-person-loeschen.md)

### Was passiert mit dem Haustier, wenn ich die Person lösche?
Das Haustier bleibt in der Liste der Haustiere. Es gehört dann keiner Person mehr und kann einer anderen zugeordnet werden.
Ausführlich: [Eine Person löschen](05-person-loeschen.md)

### Warum erscheint „Reihenfolge enthält doppelte oder fehlende Einträge." oder „Reihenfolge enthält unbekannte Personen."?
Die Liste hat sich verändert, während Sie die Reihenfolge geändert haben, zum Beispiel weil jemand eine Person gelöscht hat. Die Anwendung lädt die Liste neu und zeigt den gültigen Stand. Ändern Sie die Reihenfolge dann noch einmal.
Ausführlich: [Die Reihenfolge ändern](06-reihenfolge-aendern.md)

### Wie ändere ich die Reihenfolge der Personen?
Klicken Sie in der Zeile der Person auf den Pfeil nach oben oder nach unten. Alternativ ziehen Sie die Zeile am Ziehgriff an eine neue Stelle. Die Reihenfolge bleibt gespeichert.
Ausführlich: [Die Reihenfolge ändern](06-reihenfolge-aendern.md)

### Wie schließe ich ein Fenster, ohne zu speichern?
Klicken Sie auf **Abbrechen**. Das Kreuz oben rechts, die Taste Esc und ein Klick neben das Fenster schließen es ebenfalls. Es wird nichts gespeichert und nichts gelöscht.
Ausführlich: [Eine Person anlegen](03-person-anlegen.md)

### Was bedeutet die Zahl neben „Personen" in der linken Leiste?
Sie nennt, wie viele Personen es gibt. Sie ändert sich, wenn Sie Personen anlegen oder löschen.
Ausführlich: [Die Anwendung im Überblick](01-navigation.md)
