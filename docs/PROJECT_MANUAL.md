# Koulners Bubble – Projekt-Handbuch (Single Source of Truth)

Dieses Dokument dient als zentrale Dokumentation und "Single Source of Truth" für die Architektur, die APIs und die Workflows des Next.js-Projekts "Koulners Bubble".

## 1. High-Level Architecture & Tech Stack

Das Projekt nutzt moderne Web-Technologien, um ein leistungsstarkes, sicheres und KI-unterstütztes Headless GitOps CMS bereitzustellen.

**Kerntechnologien:**
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS
- **Authentifizierung:** NextAuth (Sicherheit & Whitelisting)
- **Speicher/Uploads:** S3-kompatibler Storage (MinIO/AWS S3) mit lokalem Fallback
- **Suche:** Fuse.js (Client-seitige Such-Engine)
- **Content:** MDX (Markdown mit React-Komponenten)
- **KI/LLM:** Vercel AI SDK mit Groq & OpenRouter (für RAG-Chatbot und Copilot)

**Architektur-Diagramm:**
```mermaid
flowchart TD
    User([Nutzer / Admin]) --> Frontend[Next.js Frontend / Bubble Studio]
    Frontend --> Auth[NextAuth (GitHub OAuth)]
    Frontend --> API[Next.js API Routes]
    
    API -->|GitOps Commit| GitHub[(GitHub Repo / Content)]
    API -->|Datei Upload| S3[(S3 / MinIO Storage)]
    API -->|RAG / Chat| LLM[Groq / OpenRouter API]
    API -->|Suche| Search[Fuse.js Index]
    
    GitHub -.->|Build/Deploy| Vercel[Vercel Hosting]
```

## 2. Directory Structure

Die Ordnerstruktur ist strikt nach Domänen und Funktionen getrennt:

- **/src/app** – Beinhaltet das Routing, alle Seiten (`page.tsx`) und serverseitigen API-Endpunkte unter `/api`.
- **/content** – Das Herzstück des Headless GitOps CMS; enthält alle Markdown- (`.md`) und MDX-Dateien (`.mdx`), unterteilt in Unterordner wie `/blog`.
- **/src/components** – Beinhaltet alle wiederverwendbaren UI-Elemente, insbesondere auch den Unterordner `/mdx` für die benutzerdefinierten MDX-Komponenten.
- **/src/studio** – *(Falls vorhanden als Modul/Feature)* Beinhaltet die Frontend-Logik und das UI des "Bubble Studio" CMS, um Artikel zu verwalten und zu editieren.
- **/public** – Statische Assets (Bilder, Favicons) sowie ein Fallback-Ordner `/uploads` für lokale Datei-Uploads in der Entwicklung.
- **/src/lib** – Wiederverwendbare Hilfsfunktionen (Utilities, Content-Parser).
- **/src/data** – Statische Daten, Konfigurationen oder lokale JSON-basierte Speichermechanismen.

## 3. API Routes Registry

Alle Backend-Endpunkte befinden sich unter `/src/app/api/...`.

| Endpunkt | HTTP-Methode | Beschreibung | Payload / Response Format |
|---|---|---|---|
| `/api/auth/[...nextauth]` | **GET / POST** | Standard-Routen von NextAuth für Login, Logout und Session-Handling. | Payload: OAuth Callbacks. Response: Session-Objekt. |
| `/api/upload` | **POST** | Lädt Bilder/Dateien in den S3-Storage (oder lokal) hoch. Erfordert Whitelist-Session. | Payload: `FormData` mit Key `file`. Response: `{ success, url, fileName, storage }` oder `{ error }`. |
| `/api/save-content` | **POST** | Der Kern des GitOps CMS: Speichert Artikel lokal und pusht sie via GitHub API. | Payload: `{ slug, rawContent, commitMessage }`. Response: `{ success, gitOps: boolean, results, message }`. |
| `/api/studio/articles` | **GET** | Listet alle bestehenden Artikel für das Bubble Studio auf. | Response: Array von Artikel-Metadaten. |
| `/api/studio/categories` | **GET / POST** | Verwaltet die verfügbaren Kategorien. | GET Response: Array von Kategorien. POST Payload: `Kategoriedaten`. |
| `/api/search` | **GET** | Nutzt Fuse.js für die Durchsuchung der Inhalte. | Payload: Query-Parameter `?q=Suchbegriff`. Response: Array von Suchergebnissen. |
| `/api/chat` | **POST** | RAG-basierter Chatbot. Lädt Blog-Wissen und nutzt LLM APIs. | Payload: `{ messages, pathname }`. Response: `TextStreamResponse` (Vercel AI SDK). |
| `/api/copilot` | **POST** | KI-Assistenz (Copilot) innerhalb des Bubble Studios. | Payload: Chat-Messages / Editor-Kontext. Response: TextStream. |
| `/api/bulk-actions` | **POST** | Erlaubt Massen-Änderungen an Artikeln via GitOps. | Payload: Array von Aktionen/Slugs. Response: Erfolgsstatus. |
| `/api/og` | **GET** | Generiert dynamische OpenGraph (OG) Images für Social Media Sharing. | Payload: Query-Parameter wie `?title=...`. Response: Generiertes Bild (PNG). |

## 4. The "Bubble Studio" (GitOps CMS) Workflow

Das **Bubble Studio** ist ein maßgeschneidertes, im Frontend integriertes Content Management System, das direkt mit dem GitHub-Repository kommuniziert (GitOps).

- **Authentifizierung & Whitelist:** Das System ist durch NextAuth streng abgesichert. Nur über Umgebungsvariablen whitelisted GitHub-Nutzer (z.B. der Administrator) dürfen sich anmelden und das Studio nutzen. Andere Zugriffe werden sofort blockiert.
- **Drafts vs. Published:** Der Veröffentlichungsstatus von Artikeln wird rein deklarativ über den Frontmatter im Markdown gesteuert (`draft: true` oder `draft: false`).
- **Programmatisches Speichern:** Wenn im Studio der Speichern-Button gedrückt wird, wird die Route `/api/save-content` aufgerufen. 
  1. Der Artikel wird zunächst in das lokale Dateisystem (`/content`) geschrieben (für eine sofortige Vorschau).
  2. Anschließend nutzt das Backend das `GITHUB_PERSONAL_ACCESS_TOKEN` in Kombination mit der Octokit REST API, um einen Commit auf dem Remote-Repository zu erzeugen.
  3. Durch diesen Commit wird ein Vercel Re-Build (oder ähnliche CI/CD) getriggert, wodurch die Änderungen live gehen.

## 5. MDX Component Library

Markdown-Artikel in diesem Projekt sind als MDX (Markdown + JSX) implementiert. Folgende Custom Components stehen im Editor zur Verfügung:

- **`<CustomImage>`**: Erstellt Bilder mit abgerundeten Ecken, Schatten und optionaler Bildunterschrift.
  ```jsx
  <CustomImage 
    src="https://.../bild.jpg" 
    alt="Bildbeschreibung" 
    caption="Eine sanfte Bildunterschrift" 
  />
  ```

- **`<YouTube>`**: Integriert ein YouTube-Video in einem responsiven 16:9-Container (No-Cookie-Modus).
  ```jsx
  <YouTube id="VIDEO_ID_HIER" />
  ```

- **`<Grid>`**: Erzeugt ein responsives zweispaltiges Layout (Side-by-Side).
  ```jsx
  <Grid>
    <div>Inhalt Spalte 1</div>
    <div>Inhalt Spalte 2</div>
  </Grid>
  ```

- **`<TableOfContents>` (oder `<toc>`)**: Generiert automatisch ein Inhaltsverzeichnis anhand der Markdown-Headings.
  ```jsx
  <TableOfContents markdown={rawMarkdownString} />
  ```

*Zusätzlich kümmert sich ein intelligenter Absatz-Renderer (`p`) darum, HTML-Nesting-Fehler bei Blockelementen zu vermeiden.*

## 6. Environment Variables (Environment Config)

Das Projekt nutzt zahlreiche Umgebungsvariablen. **(Sicherheitshinweis: Hierbei handelt es sich nur um Beschreibungen, es dürfen niemals echte Keys dokumentiert werden!)**

**Authentifizierung & Sicherheit:**
- `GITHUB_ID` & `GITHUB_SECRET`: OAuth-Credentials für den GitHub-Login.
- `AUTH_SECRET`: Ein zufälliger, mindestens 32 Zeichen langer String zum Verschlüsseln der NextAuth-Sessions.
- `ALLOWED_GITHUB_USER` & `ALLOWED_GITHUB_EMAIL`: Legt explizit fest, wer sich als Admin einloggen und das CMS nutzen darf (Whitelisting).

**GitOps CMS:**
- `GITHUB_PERSONAL_ACCESS_TOKEN`: Erforderlich, um dem System Schreibrechte (Commits) auf das GitHub Repo zu geben.
- `GITHUB_REPO_OWNER` & `GITHUB_REPO_NAME`: Gibt an, welches Repository das CMS als Datenbasis nutzt.

**Datei-Upload (S3 / MinIO):**
- `S3_ENDPOINT` & `S3_REGION`: URL und Region des S3-kompatiblen Speichers.
- `S3_ACCESS_KEY` & `S3_SECRET_KEY`: Zugangsdaten für den Bucket.
- `S3_BUCKET_NAME`: Der Name des Buckets (z.B. `koulners-bubble-media`).
- `S3_PUBLIC_URL`: (Optional) Eigene Domain für die Auslieferung der hochgeladenen Dateien.

**Künstliche Intelligenz (Chatbot & Copilot):**
- `GROQ_API_KEY`: API-Schlüssel für den primären LLM-Provider (Groq).
- `OPENROUTER_API_KEY`: API-Schlüssel für den Fallback-LLM-Provider (OpenRouter).

**Allgemein:**
- `NEXT_PUBLIC_SITE_URL`: Die Basis-URL des Projekts (z.B. für Sitemaps, Canonical Links und OG-Images).
