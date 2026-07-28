import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import remarkGfm from "remark-gfm";

const contentDirectory = path.join(process.cwd(), "content/blog");

import { CategoryType, normalizeCategories } from "./categories";
export { type CategoryType, normalizeCategories };

export interface BlogPostMeta {
  slug: string;
  title: string;
  date: string;
  category: CategoryType | CategoryType[];
  excerpt: string;
  description?: string;
  image: string;
  readTime: string;
  author: string;
  draft?: boolean;
  archived?: boolean;
}

export interface BlogPostFull extends BlogPostMeta {
  contentHtml: string;
  body: string;
}

export interface BlogPostRaw extends BlogPostMeta {
  rawContent: string;
  body: string;
}

/**
 * Holt alle Blog-Artikel Metadaten aus /content/blog, sortiert nach Datum.
 * Filtert standardmäßig alle Entwürfe (draft: true) und archivierten Artikel (archived: true) heraus!
 */
export function getAllPosts(includeDrafts = false, includeArchived = false): BlogPostMeta[] {
  if (!fs.existsSync(contentDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(contentDirectory);
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith(".md") || fileName.endsWith(".mdx"))
    .map((fileName) => {
      const slug = fileName.replace(/\.mdx?$/, "");
      const fullPath = path.join(contentDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");

      // Nutze gray-matter zum Auslesen des YAML-Frontmatters
      const matterResult = matter(fileContents);
      const data = matterResult.data as Omit<BlogPostMeta, "slug">;

      return {
        slug,
        ...data,
        draft: Boolean(data.draft),
        archived: Boolean(data.archived),
        category: normalizeCategories(data.category),
      };
    })
    .filter((post) => (includeDrafts || !post.draft) && (includeArchived || !post.archived));

  // Sortiere nach Datum absteigend
  return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1));
}

/**
 * Holt einen einzelnen Blogpost nach Slug inklusive konvertiertem HTML.
 * Blockiert Entwürfe und archivierte Beiträge bei öffentlichen Abfragen.
 */
export async function getPostBySlug(slug: string, includeDrafts = false, includeArchived = false): Promise<BlogPostFull | null> {
  const mdPath = path.join(contentDirectory, `${slug}.md`);
  const mdxPath = path.join(contentDirectory, `${slug}.mdx`);

  let fullPath = "";
  if (fs.existsSync(mdPath)) {
    fullPath = mdPath;
  } else if (fs.existsSync(mdxPath)) {
    fullPath = mdxPath;
  } else {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const matterResult = matter(fileContents);
  const data = matterResult.data as Omit<BlogPostMeta, "slug">;

  if ((!includeDrafts && data.draft === true) || (!includeArchived && data.archived === true)) {
    return null;
  }

  // Konvertiere Markdown zu HTML string
  const processedContent = await remark()
    .use(remarkGfm)
    .use(html, { sanitize: false })
    .process(matterResult.content);
  const contentHtml = processedContent.toString();

  return {
    slug,
    contentHtml,
    body: matterResult.content,
    ...data,
    draft: Boolean(data.draft),
    archived: Boolean(data.archived),
    category: normalizeCategories(data.category),
  };
}

/**
 * Holt den rohen Markdown-Inhalt inklusive Frontmatter für den Editor im Bubble Studio
 */
export function getRawPostBySlug(slug: string): BlogPostRaw | null {
  const mdPath = path.join(contentDirectory, `${slug}.md`);
  const mdxPath = path.join(contentDirectory, `${slug}.mdx`);

  let fullPath = "";
  if (fs.existsSync(mdPath)) {
    fullPath = mdPath;
  } else if (fs.existsSync(mdxPath)) {
    fullPath = mdxPath;
  } else {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const matterResult = matter(fileContents);
  const data = matterResult.data as Omit<BlogPostMeta, "slug">;

  return {
    slug,
    rawContent: fileContents,
    body: matterResult.content,
    ...data,
    draft: Boolean(data.draft),
    archived: Boolean(data.archived),
    category: normalizeCategories(data.category),
  };
}

/**
 * Speichert eine Markdown- oder MDX-Datei lokal synchron (als Fallback oder Ergänzung zu GitOps)
 */
export function saveLocalPost(slug: string, rawContent: string): void {
  const mdPath = path.join(contentDirectory, `${slug}.md`);
  const mdxPath = path.join(contentDirectory, `${slug}.mdx`);
  const rootMdPath = path.join(process.cwd(), "content", `${slug}.md`);
  const rootMdxPath = path.join(process.cwd(), "content", `${slug}.mdx`);

  const existsMd = fs.existsSync(mdPath) || fs.existsSync(rootMdPath);
  const targetExt = existsMd ? "md" : "mdx";
  const targetPath = path.join(contentDirectory, `${slug}.${targetExt}`);
  const targetRootPath = path.join(process.cwd(), "content", `${slug}.${targetExt}`);

  fs.writeFileSync(targetPath, rawContent, "utf8");
  if (fs.existsSync(path.dirname(targetRootPath))) {
    fs.writeFileSync(targetRootPath, rawContent, "utf8");
  }
}

/**
 * Holt alle verfügbaren Kategorien
 */
export function getAllCategories(includeDrafts = false): string[] {
  const posts = getAllPosts(includeDrafts);
  const categories = new Set<string>();
  posts.forEach((post) => {
    const cats = normalizeCategories(post.category);
    cats.forEach((c) => categories.add(c));
  });
  return Array.from(categories);
}

/**
 * Holt verwandte Artikel derselben Kategorie(n), schließt den aktuellen Artikel aus.
 */
export function getRelatedPosts(currentSlug: string, category: CategoryType | CategoryType[], limit = 3): BlogPostMeta[] {
  const currentCats = normalizeCategories(category);
  const allPosts = getAllPosts(false);
  const related = allPosts.filter((post) => {
    if (post.slug === currentSlug) return false;
    const postCats = normalizeCategories(post.category);
    return postCats.some((c) => currentCats.includes(c));
  });
  if (related.length < limit) {
    const others = allPosts.filter(
      (post) => post.slug !== currentSlug && !related.some((r) => r.slug === post.slug)
    );
    return [...related, ...others].slice(0, limit);
  }
  return related.slice(0, limit);
}

