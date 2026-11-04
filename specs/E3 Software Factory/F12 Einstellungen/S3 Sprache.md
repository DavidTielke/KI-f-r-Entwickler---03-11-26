# Sprache

## Meta
- **State:** Implemented

## User Story
Als Fachbereich möchte ich Stimme und Sprechtempo wählen und über den Umgang mit Spracheingaben informiert sein, damit ich die Sprachfunktionen passend und verantwortungsvoll nutze.

## Description
Die Karte „Sprache“ bietet die Auswahl von Stimme und Sprechtempo sowie einen Test. Ein Hinweis erklärt, wohin Gesprochenes übertragen wird. Die Wirkung der Auswahl beschreibt F5 S6.

## Akzeptanzkriterien
- Die Karte zeigt die Dachzeile „Ein- und Ausgabe“.
- Die Karte zeigt den Titel „Sprache.“.
- Ohne Spracherkennung im Browser zeigt die Karte „Dieser Browser unterstützt keine Spracheingabe. Bitte verwenden Sie Chrome oder Edge.“.

### Stimme
- Das Auswahlfeld „Stimme des Assistenten“ enthält die Option „Automatisch die natürlichste Stimme“.
- Das Auswahlfeld „Stimme des Assistenten“ enthält die deutschen Stimmen des Browsers in der Rangfolge aus F5 S6.
- Das Auswahlfeld ist ohne Sprachausgabe im Browser deaktiviert.

### Sprechtempo
- Das Auswahlfeld „Sprechtempo“ enthält die Option „Ruhig“ mit dem Wert `0.9`.
- Das Auswahlfeld „Sprechtempo“ enthält die Option „Normal“ mit dem Wert `1.05`.
- Das Auswahlfeld „Sprechtempo“ enthält die Option „Zügig“ mit dem Wert `1.2`.
- Das Auswahlfeld ist ohne Sprachausgabe im Browser deaktiviert.

### Test
- Der Button „Stimme testen“ liest „Guten Tag. So klinge ich, wenn ich Ihnen im Gesprächsmodus antworte.“ vor.
- Der Button „Stimme testen“ beendet zuvor eine laufende Ausgabe.
- Der Button ist ohne Sprachausgabe im Browser deaktiviert.

### Datenschutz
- Die Karte zeigt „Die Spracheingabe nutzt die Spracherkennung Ihres Browsers. In Chrome und Edge wird das Gesprochene dafür an den Cloud-Dienst des Browser-Herstellers übertragen. Sprechen Sie deshalb keine vertraulichen Daten ein, wenn das in Ihrem Haus nicht freigegeben ist.“.
