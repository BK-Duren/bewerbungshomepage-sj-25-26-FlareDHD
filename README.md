[![Open in Visual Studio Code](https://classroom.github.com/assets/open-in-vscode-2e0aaae1b6195c2367325f4f02e2d04e9abb55f0b24a779b69b11b9e10269abc.svg)](https://classroom.github.com/online_ide?assignment_repo_id=20467748&assignment_repo_type=AssignmentRepo)

## Content-Management-System (CMS)

Diese Anwendung enthält ein sehr leichtes CMS, das Inhalte aus dem Verzeichnis `content/` lädt. Aktuell werden folgende Daten verwendet:

* `content/footer.html` – HTML für den Footer (alt: JSON weiterhin lesbar als Fallback)
* `content/header.html` – komplette Kopfzeile, z. B. Logo + Menü-Button
* `content/navi.html` – Navigationselemente (Links) innerhalb der Kopfzeile
* `content/news.html` – News‑/Aktionsbereich (ersetzt Standard‑Newssektion)
* beliebige weitere `.html`- oder `.md`-Dateien lassen sich anlegen und über `/admin/content/:name` bearbeiten. Markdown-Dateien werden automatisch in HTML umgewandelt.
* Standardmäßig sind die Menüeinträge als **Anchor-Links** angelegt (z. B. `#projekt`), so dass das animierte Menü und der Smooth-Scroll wie zuvor funktionieren. 
* Du kannst in `navi.html` bei Bedarf weitere Links hinzufügen, aber die **Footer/ Header/ Navi/ News‑Knöpfe** sind nicht Teil des Standardmenüs – entferne sie einfach wieder, wie im Ausgangszustand.
* Wenn du lieber «echte» Seiten möchtest (statt nur Sprungmarken), bleibt die optionale Route `/:page` bestehen; sie belädt `content/<name>.html` oder `content/<name>.md` und packt Header, Footer, Navigation und News drumherum.

* Der Header selbst sollte **keine** `<nav>` enthalten; die Liste der Links stammt ausschließlich aus `navi.html`. Beim Laden fügt der Server `navi.html` automatisch als Navigation in den Header ein.
  Ändere den Menüinhalt durch Bearbeiten von `navi.html` über die Admin‑Schnittstelle oder direkt in der Datei.

* `/admin/content/header` zeigt jetzt beide Bereiche (Header + Navigation) gleichzeitig zum Bearbeiten an.

(ältere `.json`-Dateien werden weiterhin geladen, das System bevorzugt aber `.html`.)

Beispiele bezeichnen im Verzeichnis `content/` mit Namen wie `footer`, `header`, `navi`, `news`, sowie beliebige Seitennamen.
### Nutzung

1. **Abhängigkeiten installieren**
   ```bash
   npm install
   ```
   (die Vorlage benutzt jetzt [EJS](https://ejs.co/) für Templating)

2. **Optional: Passwort setzen**
   Lege `ADMIN_PASSWORD` in der `.env` fest, damit die Adminseite geschützt ist.

3. **Seite starten**
   ```bash
   npm run dev    # oder npm start
   ```

4. **Inhalte bearbeiten**
   Rufe im Browser `/admin/content/footer?password=geheim` (oder per POST) auf, um JSON zu ändern.
   Du kannst weitere Dateien im Verzeichnis `content/` anlegen und sie im Server über `loadContent` einbinden.


Dieser Mechanismus eignet sich für einfache statische Webseiten; für größere Projekte kannst du ein Headless-CMS wie Strapi, Contentful o. ä. anschließen.
