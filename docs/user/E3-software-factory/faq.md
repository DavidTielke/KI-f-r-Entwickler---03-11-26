# Häufige Fragen zur Software Factory

Hier finden Sie Antworten auf die häufigsten Fragen und alle Fehlermeldungen der Software Factory. Die Fragen sind nach Themen geordnet, die häufigsten stehen jeweils zuerst. Fragen zur ganzen Anwendung beantworten die [allgemeinen häufigen Fragen](../faq.md). Eine Übersicht aller Seiten steht im [Modulüberblick](README.md).

## Start, Verbindung und Systemzustand

### Was bedeutet „Der Factory-Dienst ist nicht erreichbar.“?
Die Software Factory kann ihren Hintergrunddienst auf diesem Rechner nicht erreichen. Prüfen Sie, ob die Software Factory noch gestartet ist. Starten Sie sie bei Bedarf neu und laden Sie die Seite danach neu.
Ausführlich: [Die Oberfläche kennenlernen](01-navigation.md)

### Was bedeutet „Die Anfrage ist fehlgeschlagen.“?
Der Dienst hat geantwortet, aber keinen Grund genannt. Versuchen Sie es noch einmal. Bleibt es dabei, prüfen Sie den Systemzustand unter **Einstellungen**.
Ausführlich: [Die Oberfläche kennenlernen](01-navigation.md)

### Was bedeutet „Nicht erreichbar“ unter „Anwendung“ in der Seitenleiste?
Ihre ausgelieferte Anwendung antwortet nicht. Meist ist Docker Desktop nicht gestartet. Starten Sie es, warten Sie einen Moment und laden Sie die Seite neu.
Ausführlich: [Systemzustand prüfen und die Software Factory einstellen](12-einstellungen.md)

### Was bedeutet „Docker Desktop ist nicht gestartet“ bei „Betriebsumgebung“?
Die Umgebung, in der Ihre Anwendung läuft, ist aus. Starten Sie Docker Desktop und laden Sie die Seite neu. Ohne diese Umgebung lässt sich nichts ausliefern.
Ausführlich: [Systemzustand prüfen und die Software Factory einstellen](12-einstellungen.md)

### Was bedeutet „Nicht installiert“ bei „KI-Anbindung“?
Das KI-Programm ist auf diesem Rechner nicht auffindbar. Lassen Sie die KI-Software installieren. Ohne sie arbeiten der Ideen-Dialog, der Assistent und die Umsetzung nicht.
Ausführlich: [Systemzustand prüfen und die Software Factory einstellen](12-einstellungen.md)

### Warum steht bei „Versionsverwaltung“ keine Version?
Git ist auf diesem Rechner nicht verfügbar. Lassen Sie Git installieren. Danach zeigt die Karte die Version an.
Ausführlich: [Systemzustand prüfen und die Software Factory einstellen](12-einstellungen.md)

### Warum bleibt „Wird geprüft …“ stehen?
Der Dienst der Software Factory antwortet nicht. Laden Sie die Seite neu. Hilft das nicht, starten Sie die Software Factory neu.
Ausführlich: [Systemzustand prüfen und die Software Factory einstellen](12-einstellungen.md)

### Was bedeutet „Zugriff nur lokal erlaubt.“?
Die Software Factory wurde nicht über den Rechner aufgerufen, auf dem sie läuft. Sie ist nur dort erreichbar. Öffnen Sie sie direkt auf diesem Rechner unter `http://localhost:4000`.
Ausführlich: [Systemzustand prüfen und die Software Factory einstellen](12-einstellungen.md)

### Was bedeutet „Ungültiges Anfrageformat.“?
Die Anfrage kam nicht aus der Oberfläche der Software Factory. Laden Sie die Seite neu und arbeiten Sie nur in der Oberfläche.
Ausführlich: [Systemzustand prüfen und die Software Factory einstellen](12-einstellungen.md)

### Was bedeutet „Unbekanntes KI-Modell.“?
Die gewählte Stufe der KI-Qualität kennt die Software Factory nicht. Wählen Sie eine der vier angebotenen Stufen. Die Wahl gilt für die ganze Software Factory auf diesem Rechner.
Ausführlich: [Systemzustand prüfen und die Software Factory einstellen](12-einstellungen.md)

### Warum zeigen Zahlen oder Listen alte Werte?
Die Verbindung für die automatische Aktualisierung ist unterbrochen. Die zuletzt geladenen Daten bleiben sichtbar. Laden Sie die Seite im Browser neu.
Ausführlich: [Die Oberfläche kennenlernen](01-navigation.md)

### Warum steht „Wird geladen …“ so lange da?
Die Seite holt beim Öffnen ihre Daten. Das dauert meist nur einen Moment. Bleibt die Anzeige stehen, laden Sie die Seite neu.
Ausführlich: [Das Cockpit](02-cockpit.md)

## Cockpit und Verlauf

### Warum zeigt das Cockpit eine rote Fehlermeldung?
Die Zahlen konnten nicht geladen werden. Der Text der Meldung nennt den Grund. Laden Sie die Seite neu. Bleibt der Fehler, prüfen Sie den Systemzustand unter **Einstellungen**.
Ausführlich: [Das Cockpit](02-cockpit.md)

### Was bedeutet „Im Moment ist nichts von Ihnen erforderlich.“ und „Derzeit läuft kein Auftrag.“?
Beide Meldungen sind gute Nachrichten. Es gibt keinen offenen Schritt für Sie, und es wartet oder läuft kein Auftrag. Neue Aufträge starten Sie unter **Umsetzung**.
Ausführlich: [Das Cockpit](02-cockpit.md)

### Warum stimmen die Zahlen im Cockpit nicht mit der Anforderungsliste überein?
Das Cockpit zählt nur die Anforderungen Ihrer Anwendung. Die Anforderungen der Software Factory selbst zählt es nicht mit. Das ist gewollt.
Ausführlich: [Das Cockpit](02-cockpit.md)

### Was bedeutet „Keine Einträge.“ im Verlauf?
Dazu steht „Für diesen Filter gibt es noch keine Ereignisse.“ Zum gewählten Filter gibt es noch nichts. Klicken Sie auf **Alle** oder wählen Sie einen anderen Filter.
Ausführlich: [Den Verlauf nachlesen](11-verlauf.md)

### Warum lässt sich ein Eintrag im Verlauf nicht anklicken?
Zu diesem Eintrag gibt es kein Ziel, zu dem Sie wechseln könnten. Lesen Sie den Titel und die Spalte **Nachweis**.
Ausführlich: [Den Verlauf nachlesen](11-verlauf.md)

## Ideen und das Gespräch mit dem Product Owner

### Wie lange dauert eine Antwort der KI, und was tue ich bei einem Fehler?
Eine Runde endet spätestens nach fünf Minuten. Bei einem Fehler erscheint eine rote Meldung mit der Schaltfläche **Erneut versuchen**. Ein Klick darauf wiederholt die Runde, ohne eine neue Nachricht anzulegen. Die Meldungen im Einzelnen stehen in den folgenden Fragen.
Ausführlich: [Im Gespräch mit dem Product Owner](04-ideen-dialog.md)

### Was bedeutet „Die KI hat die Zeitvorgabe überschritten.“?
Die Runde hat länger als fünf Minuten gedauert. Klicken Sie auf **Erneut versuchen**.
Ausführlich: [Im Gespräch mit dem Product Owner](04-ideen-dialog.md)

### Was bedeutet „Die KI hat keine auswertbare Antwort geliefert.“?
Die Antwort der KI war nicht lesbar. Klicken Sie auf **Erneut versuchen**.
Ausführlich: [Im Gespräch mit dem Product Owner](04-ideen-dialog.md)

### Was bedeutet „Die KI konnte den Auftrag nicht abschließen.“?
Ein anderer Fehler ist aufgetreten. Klicken Sie auf **Erneut versuchen**. Hilft das nicht, versuchen Sie es später noch einmal.
Ausführlich: [Im Gespräch mit dem Product Owner](04-ideen-dialog.md)

### Was bedeutet „Die KI ist nicht angemeldet. Bitte starten Sie einmal „claude“ in einem Terminal und melden Sie sich an.“?
Die KI ist auf diesem Rechner nicht angemeldet. Bitten Sie die Person, die die Software Factory betreut, sich anzumelden. Klicken Sie danach auf **Erneut versuchen**.
Ausführlich: [Im Gespräch mit dem Product Owner](04-ideen-dialog.md)

### Was bedeutet „Das KI-Kontingent ist derzeit ausgeschöpft oder überlastet. Bitte versuchen Sie es später erneut.“?
Die KI ist zurzeit nicht verfügbar. Warten Sie einige Minuten. Klicken Sie dann auf **Erneut versuchen**.
Ausführlich: [Im Gespräch mit dem Product Owner](04-ideen-dialog.md)

### Was bedeutet „Die KI-Anbindung „claude“ ist auf diesem Rechner nicht installiert.“?
Die KI-Software fehlt auf diesem Rechner. Bitten Sie die Person, die die Software Factory betreut, sie zu installieren.
Ausführlich: [Im Gespräch mit dem Product Owner](04-ideen-dialog.md)

### Was bedeutet „Die Antwort wurde durch einen Neustart unterbrochen. Bitte versuchen Sie es erneut.“?
Die Software Factory wurde während der Runde neu gestartet. Der Gesprächsverlauf bleibt dabei erhalten. Klicken Sie auf **Erneut versuchen**.
Ausführlich: [Im Gespräch mit dem Product Owner](04-ideen-dialog.md)

### Was bedeutet „Die KI arbeitet noch an der letzten Antwort.“?
Pro Idee läuft immer nur eine Runde. Sie haben geschrieben, während die KI noch arbeitet. Warten Sie, bis sie fertig ist.
Ausführlich: [Im Gespräch mit dem Product Owner](04-ideen-dialog.md)

### Was bedeutet „Bitte beschreiben Sie Ihr Anliegen.“ und „Bitte beschreiben Sie Ihre Idee.“?
Das Feld **Ihre Idee** ist leer, oder der Dienst hat einen leeren Text zurückgewiesen. Schreiben Sie einen oder mehrere Sätze in das Feld. Klicken Sie dann erneut auf **Dialog starten**.
Ausführlich: [Die Ideen-Tafel](03-ideen-tafel.md)

### Was tue ich, wenn beim Anlegen einer Idee eine andere Fehlermeldung erscheint?
Der Dialog bleibt offen, und Ihr Text bleibt im Feld stehen. Lesen Sie die Meldung. Versuchen Sie es nach einem Moment erneut.
Ausführlich: [Die Ideen-Tafel](03-ideen-tafel.md)

### Was bedeutet die Marke „Störung“ auf einer Karte?
Die letzte Runde der KI ist bei dieser Idee fehlgeschlagen. Öffnen Sie die Karte und klicken Sie im Gespräch auf **Erneut versuchen**.
Ausführlich: [Die Ideen-Tafel](03-ideen-tafel.md)

### Warum fehlt eine Idee auf der Tafel?
Nur Ideen in der vorgesehenen Form erscheinen auf der Tafel. Legen Sie die Idee über **Idee erfassen** an.
Ausführlich: [Die Ideen-Tafel](03-ideen-tafel.md)

### Was bedeutet „Bitte geben Sie eine Antwort ein.“?
Das Eingabefeld im Gespräch war leer. Schreiben Sie eine Antwort und senden Sie erneut.
Ausführlich: [Im Gespräch mit dem Product Owner](04-ideen-dialog.md)

### Was bedeutet „Die Idee ist noch nicht bereit: …“?
Beim Freigeben fehlt noch ein Punkt des Reifegrads. Die Meldung nennt ihn. Klären Sie den Punkt im Gespräch und geben Sie die Idee dann erneut frei.
Ausführlich: [Im Gespräch mit dem Product Owner](04-ideen-dialog.md)

### Was bedeutet „Diese Idee ist freigegeben. Öffnen Sie sie erneut, um weiter daran zu arbeiten.“?
Eine freigegebene Idee lässt sich nicht bearbeiten. Klicken Sie auf **Erneut öffnen**. Danach können Sie im Gespräch weiterarbeiten.
Ausführlich: [Im Gespräch mit dem Product Owner](04-ideen-dialog.md)

### Was bedeutet „Nur freigegebene Ideen lassen sich erneut öffnen.“?
Die Idee ist nicht freigegeben. Für Ideen in Klärung ist nichts nötig, Sie können einfach weiterarbeiten.
Ausführlich: [Im Gespräch mit dem Product Owner](04-ideen-dialog.md)

### Was bedeutet „Diese Idee wird gerade in Anforderungen überführt.“?
Ein Auftrag verarbeitet die Idee. Warten Sie, bis der Auftrag fertig ist. Solange er läuft, lässt sich die Idee weder erneut öffnen noch verwerfen.
Ausführlich: [Im Gespräch mit dem Product Owner](04-ideen-dialog.md)

### Was bedeutet „Eine überführte Idee bleibt als Nachweis erhalten und lässt sich nicht löschen.“?
Eine Idee, aus der schon Anforderungen entstanden sind, lässt sich nicht verwerfen. Sie dient als Nachweis. Für diese Idee ist nichts zu tun.
Ausführlich: [Im Gespräch mit dem Product Owner](04-ideen-dialog.md)

### Was bedeutet „Diese Idee existiert nicht mehr.“?
Die Idee wurde verworfen, oder es gibt sie nicht. Gehen Sie über **Zurück** zur Tafel.
Ausführlich: [Im Gespräch mit dem Product Owner](04-ideen-dialog.md)

## Sprache

### Warum sehe ich kein Mikrofon-Symbol?
Ihr Browser unterstützt keine Spracherkennung. Dann steht in der Karte: „Dieser Browser unterstützt keine Spracheingabe. Bitte verwenden Sie Chrome oder Edge.“ Wechseln Sie zu Chrome oder Edge.
Ausführlich: [Mit der Stimme arbeiten](05-sprache.md)

### Was bedeutet „Der Browser hat den Zugriff auf das Mikrofon nicht erlaubt.“?
Sie haben den Zugriff auf das Mikrofon verweigert. Erlauben Sie das Mikrofon in den Einstellungen des Browsers neben der Adresszeile. Laden Sie die Seite danach neu.
Ausführlich: [Mit der Stimme arbeiten](05-sprache.md)

### Was bedeutet „Es wurde kein Mikrofon gefunden.“?
Am Rechner ist kein Mikrofon angeschlossen oder aktiv. Schließen Sie ein Mikrofon an. Wählen Sie es in den Einstellungen Ihres Rechners.
Ausführlich: [Mit der Stimme arbeiten](05-sprache.md)

### Was bedeutet „Die Spracherkennung des Browsers ist nicht erreichbar.“?
Der Erkennungsdienst des Browsers antwortet nicht, zum Beispiel ohne Internet. Prüfen Sie Ihre Verbindung. Versuchen Sie es dann erneut.
Ausführlich: [Mit der Stimme arbeiten](05-sprache.md)

### Was bedeutet „Der Browser unterstützt die Spracherkennung auf Deutsch nicht.“?
Dem Browser fehlt die deutsche Erkennung. Nutzen Sie einen aktuellen Chrome oder Edge.
Ausführlich: [Mit der Stimme arbeiten](05-sprache.md)

### Was bedeutet „Die Spracherkennung ist fehlgeschlagen.“?
Ein anderer Fehler ist aufgetreten. Klicken Sie erneut auf das Mikrofon.
Ausführlich: [Mit der Stimme arbeiten](05-sprache.md)

### Warum höre ich nichts, wenn der Product Owner vorliest?
Die Sprachausgabe ist stumm oder nicht verfügbar. Prüfen Sie die Lautstärke. Testen Sie unter **Einstellungen** mit **Stimme testen**.
Ausführlich: [Mit der Stimme arbeiten](05-sprache.md)

### Wird mein Gesprochenes irgendwohin übertragen?
In Chrome und Edge wird das Gesprochene an den Cloud-Dienst des Browser-Herstellers übertragen. Sprechen Sie deshalb keine vertraulichen Inhalte ein, wenn das in Ihrem Haus nicht freigegeben ist.
Ausführlich: [Mit der Stimme arbeiten](05-sprache.md)

## Anforderungen erstellen und pflegen

### Was bedeutet „Nur freigegebene Ideen lassen sich in Anforderungen überführen.“?
Die Idee ist noch nicht freigegeben. Geben Sie die Idee im Gespräch frei. Danach erscheint **Anforderungen erstellen**.
Ausführlich: [Aus einer Idee Anforderungen erstellen](06-ueberfuehrung-in-anforderungen.md)

### Was bedeutet „Diese Idee wird bereits überführt.“?
Ein Auftrag zu dieser Idee wartet oder läuft schon. Öffnen Sie den Auftrag unter **Umsetzung** und warten Sie ab.
Ausführlich: [Aus einer Idee Anforderungen erstellen](06-ueberfuehrung-in-anforderungen.md)

### Was bedeutet „Unter den Anforderungen liegen nicht gesicherte Änderungen. Bitte sichern oder verwerfen Sie diese zuerst.“?
Es gibt noch ungesicherte Änderungen an den Anforderungen, zum Beispiel aus einem früheren Auftrag. Sichern oder verwerfen Sie die Änderungen. Beauftragen Sie danach erneut.
Ausführlich: [Aus einer Idee Anforderungen erstellen](06-ueberfuehrung-in-anforderungen.md)

### Was bedeutet „Die KI hat keine Anforderungen angelegt.“?
Die KI hat nichts Brauchbares geschrieben. Beauftragen Sie die Überführung erneut. Ergänzen Sie sonst die Idee.
Ausführlich: [Aus einer Idee Anforderungen erstellen](06-ueberfuehrung-in-anforderungen.md)

### Was bedeutet „Einige Anforderungen entsprechen nicht dem vorgeschriebenen Format.“?
Mindestens eine Anforderung ist unvollständig, zum Beispiel ohne Titel oder ohne Abnahmekriterien. Öffnen Sie die technischen Details im Auftrag. Beauftragen Sie danach erneut.
Ausführlich: [Aus einer Idee Anforderungen erstellen](06-ueberfuehrung-in-anforderungen.md)

### Was bedeutet „Die KI hat Dateien außerhalb der Anforderungen verändert.“?
Die KI hat mehr angefasst als erlaubt. Die Software Factory bricht deshalb ab. Prüfen Sie die technischen Details und beauftragen Sie erneut.
Ausführlich: [Aus einer Idee Anforderungen erstellen](06-ueberfuehrung-in-anforderungen.md)

### Warum sehe ich „Keine Anforderungen gefunden.“?
Dazu steht „Ändern Sie den Filter oder legen Sie eine neue Anforderung an.“ Kein Eintrag passt zu Suche, Themenbereich und Status. Leeren Sie das Suchfeld, klicken Sie auf **Alle** und auf **Alle Themenbereiche**.
Ausführlich: [Anforderungen ansehen, anlegen, ändern und entfernen](07-anforderungen.md)

### Was bedeutet „Diese Anforderung existiert nicht mehr.“?
Die Anforderung wurde entfernt, oder die Adresse ist falsch. Öffnen Sie die Seite **Anforderungen**. Wählen Sie die Anforderung dort aus.
Ausführlich: [Anforderungen ansehen, anlegen, ändern und entfernen](07-anforderungen.md)

### Welche Pflichtangaben hat eine Anforderung, und welche Meldungen kommen bei Fehlern?
Fehlt eine Angabe, erscheint eine Meldung: „Bitte geben Sie der Anforderung einen Titel.“, „Der Titel darf höchstens 120 Zeichen lang sein.“, „Bitte beschreiben Sie den Nutzen in einem Satz.“ oder „Bitte erfassen Sie mindestens ein Abnahmekriterium.“ Tragen Sie die Angabe ein, kürzen Sie den Titel oder formulieren Sie den Nutzen als „Als … möchte ich …, damit …“. Mindestens ein Kriterium muss eine prüfbare Aussage enthalten.
Ausführlich: [Anforderungen ansehen, anlegen, ändern und entfernen](07-anforderungen.md)

### Was bedeutet „Bitte wählen Sie einen Themenbereich.“ oder „Bitte wählen Sie eine Funktion.“?
Bei **Neuer Themenbereich …** oder **Neue Funktion …** fehlt der Name. Tragen Sie den Namen ein. Oder wählen Sie einen vorhandenen Eintrag.
Ausführlich: [Anforderungen ansehen, anlegen, ändern und entfernen](07-anforderungen.md)

### Warum kann ich Anforderungen der Software Factory nicht ändern?
Dann sehen Sie die Meldung „Der Themenbereich „Software Factory“ wird nicht über die Factory geändert.“ Dieser Themenbereich beschreibt die Anwendung selbst und ist nur lesbar. Wählen Sie einen anderen Themenbereich.
Ausführlich: [Anforderungen ansehen, anlegen, ändern und entfernen](07-anforderungen.md)

### Warum lassen sich Anforderungen gerade nicht ändern?
Es erscheint „Während eines laufenden Auftrags lassen sich Anforderungen nicht ändern. Bitte warten Sie den Abschluss ab.“ Solange ein Auftrag läuft, ändert die KI den gemeinsamen Arbeitsstand. Warten Sie, bis der Auftrag beendet ist, und versuchen Sie es dann erneut. Die Sperre endet von selbst.
Ausführlich: [Anforderungen ansehen, anlegen, ändern und entfernen](07-anforderungen.md)

### Was bedeutet „Bereits umgesetzte Anforderungen bleiben als Nachweis erhalten und lassen sich nicht löschen.“?
Die Anforderung war schon einmal umgesetzt oder gehört zur Software Factory. Entfernen lässt sie sich deshalb nicht. Ändern Sie sie stattdessen mit **Bearbeiten**.
Ausführlich: [Anforderungen ansehen, anlegen, ändern und entfernen](07-anforderungen.md)

### Was bedeutet „Diese Unterlage existiert nicht.“?
Die Unterlage wurde inzwischen entfernt. Schließen Sie das Fenster und laden Sie die Seite neu.
Ausführlich: [Anforderungen ansehen, anlegen, ändern und entfernen](07-anforderungen.md)

## Der Anforderungs-Assistent

### Was bedeutet „Bitte beschreiben Sie, was die Anwendung künftig können soll.“?
Die Software Factory hat keinen Text erhalten. Tragen Sie in das Feld **Was soll die Anwendung künftig können** einen Text ein. Klicken Sie erneut auf **Gespräch starten**. Unter dem Feld kann auch „Bitte beschreiben Sie Ihr Anliegen.“ stehen, dann ist das Feld leer.
Ausführlich: [Anforderungen mit dem KI-Assistenten entwickeln](08-anforderungs-assistent.md)

### Warum ist „Anforderung anlegen“ im Assistenten ausgegraut?
Es fehlen ein Titel, ein Nutzen oder ein Abnahmekriterium, oder der Assistent arbeitet noch. Ergänzen Sie die Angaben im Gespräch oder mit dem Stift-Symbol. Oder warten Sie, bis **Assistent arbeitet** verschwindet.
Ausführlich: [Anforderungen mit dem KI-Assistenten entwickeln](08-anforderungs-assistent.md)

### Was bedeutet „Dieser Entwurf existiert nicht mehr.“?
Der Entwurf wurde verworfen. Öffnen Sie die Seite **Anforderungen** und starten Sie neu.
Ausführlich: [Anforderungen mit dem KI-Assistenten entwickeln](08-anforderungs-assistent.md)

### Was bedeutet „Dieser Entwurf wurde bereits gespeichert.“?
Der Entwurf ist schon eine Anforderung. Öffnen Sie die Anforderung auf der Seite **Anforderungen**.
Ausführlich: [Anforderungen mit dem KI-Assistenten entwickeln](08-anforderungs-assistent.md)

### Was tue ich bei einer roten Meldung mit „Erneut versuchen“ im Assistenten?
Die KI konnte nicht antworten. Klicken Sie auf **Erneut versuchen**. Die Meldung „Die KI arbeitet noch an der letzten Antwort.“ heißt, dass Sie den Entwurf geändert haben, während der Assistent arbeitet. Warten Sie dann, bis **Assistent arbeitet** verschwindet.
Ausführlich: [Anforderungen mit dem KI-Assistenten entwickeln](08-anforderungs-assistent.md)

## Qualitätsprüfung

### Warum dauert „Prüfung läuft …“ so lange?
Die KI arbeitet noch. Warten Sie. Die Seite bleibt währenddessen bedienbar.
Ausführlich: [Die Qualität von Abnahmekriterien prüfen](09-qualitaetspruefung.md)

### Was tue ich bei „Die KI hat keine Antwort geliefert.“ nach der Prüfung?
Die KI konnte nicht antworten. Klicken Sie erneut auf **Qualität prüfen**. Hilft das nicht, prüfen Sie den Systemzustand unter **Einstellungen**.
Ausführlich: [Die Qualität von Abnahmekriterien prüfen](09-qualitaetspruefung.md)

### Warum fehlt „Vorschlag übernehmen“, oder warum ist „Qualität prüfen“ ausgegraut?
Fehlt **Vorschlag übernehmen**, lässt sich die Anforderung nicht ändern. Dann läuft ein Auftrag, oder die Anforderung gehört zur Software Factory. Ist **Qualität prüfen** im Assistenten grau, fehlen Titel, Nutzen oder ein Kriterium, oder der Assistent arbeitet noch.
Ausführlich: [Die Qualität von Abnahmekriterien prüfen](09-qualitaetspruefung.md)

## Umsetzung und Aufträge

### Was bedeutet „Noch keine Aufträge.“?
Es wurde noch nichts beauftragt. Dazu steht „Wählen Sie unter Anforderungen die offenen Punkte aus und starten Sie die Umsetzung.“ Wählen Sie unter **Anforderungen** offene Punkte aus und starten Sie die Umsetzung.
Ausführlich: [Aufträge verfolgen: die Seite Umsetzung](10-umsetzung.md)

### Warum steht ein Auftrag lange auf „Wartet“?
Es läuft immer nur ein Auftrag. Ein anderer Auftrag arbeitet noch. Warten Sie, bis er fertig ist. Der wartende Auftrag startet dann von selbst.
Ausführlich: [Aufträge verfolgen: die Seite Umsetzung](10-umsetzung.md)

### Was bedeutet „Der Auftrag wurde durch einen Neustart des Dienstes unterbrochen.“?
Die Software Factory wurde während der Arbeit neu gestartet. Wartende und laufende Aufträge gelten dann als fehlgeschlagen. Öffnen Sie den Auftrag und klicken Sie auf **Erneut beauftragen**. Liegen noch Änderungen vor, klicken Sie zuerst auf **Änderungen verwerfen**.
Ausführlich: [Aufträge verfolgen: die Seite Umsetzung](10-umsetzung.md)

### Was bedeutet „Bitte wählen Sie mindestens eine Anforderung aus.“?
Es ist keine Anforderung gewählt. Schließen Sie den Dialog und wählen Sie eine Anforderung aus.
Ausführlich: [Anforderungen auswählen und beauftragen](10a-auswahl-und-beauftragung.md)

### Was bedeutet „Die Anforderung {Nummer} ist bereits umgesetzt.“?
An Stelle von {Nummer} steht die Nummer der Anforderung. Sie ist schon fertig. Nehmen Sie sie aus der Auswahl.
Ausführlich: [Anforderungen auswählen und beauftragen](10a-auswahl-und-beauftragung.md)

### Was bedeutet „Die Anforderung {Nummer} ist bereits beauftragt.“?
Die Anforderung wartet oder läuft schon. Verfolgen Sie den Auftrag auf der Seite **Umsetzung**.
Ausführlich: [Anforderungen auswählen und beauftragen](10a-auswahl-und-beauftragung.md)

### Was bedeutet „Der Themenbereich „Software Factory“ lässt sich nicht über die Factory selbst umsetzen.“?
Anforderungen der Software Factory selbst sind von der Umsetzung ausgeschlossen. Nehmen Sie sie aus der Auswahl.
Ausführlich: [Anforderungen auswählen und beauftragen](10a-auswahl-und-beauftragung.md)

### Warum ist das Auswahlfeld im Tabellenkopf grau?
Es sind keine offenen Anforderungen sichtbar. Ändern Sie den Filter auf **Umsetzung offen**.
Ausführlich: [Anforderungen auswählen und beauftragen](10a-auswahl-und-beauftragung.md)

### Was bedeutet „Dieser Auftrag existiert nicht.“?
Die Nummer in der Adresse ist unbekannt. Öffnen Sie den Auftrag über die Seite **Umsetzung**.
Ausführlich: [Einen Auftrag verfolgen](10b-auftrag.md)

### Was bedeutet „Im Arbeitsstand liegen nicht gesicherte Änderungen. Bitte sichern oder verwerfen Sie diese, bevor eine Umsetzung startet.“?
Im Projekt liegen Änderungen, die noch nicht gesichert sind. Lassen Sie die Änderungen sichern oder verwerfen. Beauftragen Sie danach erneut. Dieselbe Meldung ohne den zweiten Satz erscheint auch bei einer Rücknahme.
Ausführlich: [Einen Auftrag verfolgen](10b-auftrag.md)

### Was bedeutet „Die Betriebsumgebung ist nicht erreichbar. Bitte starten Sie Docker Desktop.“?
Das Programm, das die Anwendung betreibt, läuft nicht. Starten Sie Docker Desktop. Beauftragen Sie den Auftrag danach erneut.
Ausführlich: [Einen Auftrag verfolgen](10b-auftrag.md)

### Was bedeutet „Die KI hat Dateien außerhalb des erlaubten Bereichs verändert.“?
Die KI hat etwas angefasst, das sie nicht ändern darf. Der Auftrag endet. Verwerfen Sie die Änderungen.
Ausführlich: [Einen Auftrag abbrechen und Änderungen verwerfen](10d-abbrechen-und-verwerfen.md)

### Was bedeutet „Die Anwendung antwortet nach der Auslieferung nicht fehlerfrei.“?
Die neue Version läuft auch nach den Nachbesserungen nicht richtig. Öffnen Sie **Technische Details** auf der Seite des Auftrags. Wenden Sie sich an die Entwicklung. Ist die Auslieferung schon gesichert, können Sie sie zurücknehmen.
Ausführlich: [Selbstständige Nachbesserung verstehen](10h-nachbesserung.md)

### Warum endet ein Auftrag mit „Fehlgeschlagen“, obwohl die KI nachgebessert hat?
Die Versuche zur Nachbesserung sind ausgeschöpft. Pro Bauschritt gibt es höchstens zwei, ebenso für die Auslieferung. Lesen Sie die Meldung. Verwerfen Sie die Änderungen, falls angeboten, und beauftragen Sie erneut.
Ausführlich: [Selbstständige Nachbesserung verstehen](10h-nachbesserung.md)

## Protokoll, Abbrechen und Rücknahme

### Was bedeutet „Der Auftrag wartet auf seinen Start.“ oder „Noch keine Einträge.“ im Protokoll?
Ein anderer Auftrag arbeitet noch, oder der Auftrag hat noch nichts protokolliert. Warten Sie. Der Auftrag startet von selbst.
Ausführlich: [Das Arbeitsprotokoll lesen](10c-arbeitsprotokoll.md)

### Was bedeutet „Die KI wollte {n} nicht freigegebene Aktionen ausführen. Sie wurden blockiert.“?
An Stelle von {n} steht eine Anzahl. Die Schutzregeln haben Aktionen verhindert. Das ist ein Schutz und kein Fehler. Sie müssen nichts tun.
Ausführlich: [Das Arbeitsprotokoll lesen](10c-arbeitsprotokoll.md)

### Was bedeutet „Der Bau ist fehlgeschlagen. Die KI bessert nach.“?
Die neue Version ließ sich nicht bauen. Warten Sie. Die KI versucht es selbst erneut.
Ausführlich: [Das Arbeitsprotokoll lesen](10c-arbeitsprotokoll.md)

### Was bedeutet „Dieser Auftrag läuft nicht mehr.“?
Der Auftrag war schon fertig, als Sie abgebrochen haben. Laden Sie die Seite. Lesen Sie das Ergebnis.
Ausführlich: [Einen Auftrag abbrechen und Änderungen verwerfen](10d-abbrechen-und-verwerfen.md)

### Was bedeutet „Zu diesem Auftrag gibt es keine verwerfbaren Änderungen.“?
Es liegen keine nicht gesicherten Änderungen vor. Beauftragen Sie den Auftrag gegebenenfalls erneut.
Ausführlich: [Einen Auftrag abbrechen und Änderungen verwerfen](10d-abbrechen-und-verwerfen.md)

### Was bedeutet „Bitte warten Sie, bis der laufende Auftrag abgeschlossen ist.“?
Ein anderer Auftrag läuft gerade. Dann lässt sich nichts verwerfen. Warten Sie, oder brechen Sie den laufenden Auftrag ab.
Ausführlich: [Einen Auftrag abbrechen und Änderungen verwerfen](10d-abbrechen-und-verwerfen.md)

### Was bedeutet „Diese Auslieferung enthält eine Datenbankänderung und lässt sich deshalb nicht automatisch zurücknehmen.“?
Die Auslieferung verändert die Datenbank. Die Schaltfläche zur Rücknahme fehlt dann. Wenden Sie sich an die Entwicklung.
Ausführlich: [Eine Auslieferung zurücknehmen](10e-auslieferung-zuruecknehmen.md)

### Was bedeutet „Nur ausgelieferte Umsetzungen lassen sich zurücknehmen.“?
Der Auftrag ist keine Umsetzung oder hat keine Version. Öffnen Sie die passende Umsetzung.
Ausführlich: [Eine Auslieferung zurücknehmen](10e-auslieferung-zuruecknehmen.md)

### Was bedeutet „Diese Auslieferung wurde bereits zurückgenommen.“ oder „Diese Auslieferung wird bereits zurückgenommen.“?
Die erste Meldung heißt: Die Rücknahme ist schon erfolgt. Die zweite heißt: Eine Rücknahme wartet oder läuft schon. Verfolgen Sie sie auf der Seite **Umsetzung**.
Ausführlich: [Eine Auslieferung zurücknehmen](10e-auslieferung-zuruecknehmen.md)

### Was bedeutet „Im Arbeitsstand liegen nicht gesicherte Änderungen.“ bei einer Rücknahme?
Im Projekt liegen noch ungesicherte Änderungen. Lassen Sie sie sichern oder verwerfen. Starten Sie die Rücknahme danach erneut.
Ausführlich: [Eine Auslieferung zurücknehmen](10e-auslieferung-zuruecknehmen.md)

### Was bedeutet „Die Auslieferung lässt sich nicht automatisch zurücknehmen, weil spätere Änderungen darauf aufbauen.“?
Neuere Arbeit hängt von dieser Auslieferung ab. Die Software Factory hat den Stand zurückgesetzt. Wenden Sie sich an die Entwicklung.
Ausführlich: [Eine Auslieferung zurücknehmen](10e-auslieferung-zuruecknehmen.md)

### Was bedeutet „Bitte verwerfen Sie zuerst die Änderungen des abgebrochenen Laufs.“?
Vom letzten Lauf liegen noch Änderungen vor. Klicken Sie auf **Änderungen verwerfen**. Versuchen Sie es dann erneut.
Ausführlich: [Einen Auftrag erneut beauftragen](10f-erneut-beauftragen.md)

### Was bedeutet „Dieser Auftrag lässt sich nicht wiederholen.“?
Eine Rücknahme lässt sich nicht erneut beauftragen. Beauftragen Sie die Rücknahme über die Umsetzung neu.
Ausführlich: [Einen Auftrag erneut beauftragen](10f-erneut-beauftragen.md)

### Was bedeutet „Alle Anforderungen dieses Auftrags sind bereits umgesetzt.“?
Es gibt nichts mehr zu tun. Bei einer Umsetzung werden nur offene Anforderungen übernommen. Sie müssen nichts tun.
Ausführlich: [Einen Auftrag erneut beauftragen](10f-erneut-beauftragen.md)

### Warum fehlt die Karte „Geänderte Bereiche“?
Der Auftrag läuft noch, ist keine Umsetzung oder hat nichts gesichert. Bei Überführungen und Rücknahmen gibt es die Karte nie. Warten Sie auf das Ende des Auftrags.
Ausführlich: [Geänderte Bereiche prüfen](10g-geaenderte-bereiche.md)

### Warum ist die Liste der Bereiche zugeklappt?
Das ist der Normalzustand. Klicken Sie auf **Technische Details**, um die Liste zu öffnen.
Ausführlich: [Geänderte Bereiche prüfen](10g-geaenderte-bereiche.md)
