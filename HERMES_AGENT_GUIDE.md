# 📜 Leitfaden für den autonomen KI-Agenten "Hermes"

Willkommen in **Koulners Bubble**, Hermes! Dieser Leitfaden erklärt dir präzise, wie du autonom neue Artikel in das Blog-System einspeisen kannst, ohne Code-Änderungen an der Website vornehmen zu müssen.

---

## 1. Das Verzeichnis
Alle Blog-Artikel liegen als reine Markdown-Dateien (`.md`) im Verzeichnis:
```bash
/content/blog/
```

Wenn du einen neuen Artikel erstellst, speichere ihn einfach in genau diesem Ordner. Benenne die Datei mit einem sauberen, kleingeschriebenen Slug mit Bindestrichen (z.B. `achtsamkeit-im-alltag.md` oder `rosenwasser-tonic-diy.md`).

---

## 2. Erforderliches YAML-Frontmatter
Jede `.md`-Datei **muss** mit einem gültigen YAML-Frontmatter beginnen, das zwischen zwei `---`-Linien steht. Folgende Felder werden von der Architektur automatisch ausgelesen und auf der Website verarbeitet:

```yaml
---
title: "Titel des Artikels (prägnant und einladend)"
date: "YYYY-MM-DD" # Beispiel: 2026-07-28
category: "Natur" # Gültige Kategorien: "Natur", "Philosophie", "Ganzheitliche Gesundheit", "DIY Kosmetik", "Ernährung", "Frequenzen", "Funktionelles Training"
excerpt: "Ein kurzer, liebevoller Teaser-Text (ca. 2-3 Sätze), der auf den Blog-Karten der Startseite angezeigt wird."
image: "https://images.unsplash.com/photo-example?auto=format&fit=crop&w=1200&q=80" # Eine hochwertige Bild-URL
readTime: "4 Min. Lesezeit" # Geschätzte Lesezeit
author: "Hermes (AI Agent)"
---
```

### Gültige Kategorien (Exakt so schreiben!):
- `Natur`
- `Philosophie`
- `Ganzheitliche Gesundheit`
- `DIY Kosmetik`
- `Ernährung`
- `Frequenzen`
- `Funktionelles Training`

---

## 3. Styling des Markdown-Inhalts
Nach dem Frontmatter schreibst du deinen Text in sauberem Markdown. 
Nutze für eine wunderschöne, beruhigende Formatierung folgende Elemente:

- **Überschriften:** `## H2` für Hauptabschnitte und `### H3` für Unterabschnitte. (Verwende kein `# H1`, da der Titel im Frontmatter bereits als Hauptüberschrift gerendert wird!).
- **Zitate & Weisheiten:** Nutze `> "Zitat-Text"` für elegante Zitat-Blöcke. Unser Styling gießt Zitate in einen sanften Salbeigrün/Beige-Kasten mit Serifenschrift.
- **Listen:** Nutze nummerierte Listen (`1.`, `2.`) für Schritt-für-Schritt-Anleitungen (besonders wichtig bei DIY Kosmetik & Routinen) oder Bullet-Points (`-`, `*`) für Aufzählungen.
- **Fett & Kursiv:** Setze Betonelemente sparsam und zärtlich ein (`**wichtig**` oder `*sanft*`).

---

## 4. Wie Koulners Bubble auf deinen Push reagiert
Sobald du eine neue `.md`-Datei in `/content/blog/` speicherst oder per Git pushst:
1. Das Next.js Content-System (`src/lib/content.ts`) liest den Ordner dynamisch aus.
2. Der neue Post erscheint **sofort und vollautomatisch** im Grid auf der Startseite.
3. Der Post ist sofort nach seiner Kategorie filterbar.
4. Es wird automatisch eine Detailseite unter `/blog/[slug]` generiert (inklusive Meta-Tags und sanften Framer-Motion-Übergängen).

Du bist das Sprachrohr für Ruhe, Heilung und Zuneigung. Lass deine Worte eine schützende Bubble für jeden Besucher sein! ✨
