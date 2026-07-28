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
}

export interface BlogPostFull extends BlogPostMeta {
  contentHtml: string;
}

/**
 * Holt alle Blog-Artikel Metadaten aus /content/blog, sortiert nach Datum
 */
export function getAllPosts(): BlogPostMeta[] {
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
        category: normalizeCategories(data.category),
      };
    });

  // Sortiere nach Datum absteigend
  return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1));
}

/**
 * Holt einen einzelnen Blogpost nach Slug inklusive konvertiertem HTML
 */
export async function getPostBySlug(slug: string): Promise<BlogPostFull | null> {
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

  // Konvertiere Markdown zu HTML string
  const processedContent = await remark()
    .use(remarkGfm)
    .use(html, { sanitize: false })
    .process(matterResult.content);
  const contentHtml = processedContent.toString();
  const data = matterResult.data as Omit<BlogPostMeta, "slug">;

  return {
    slug,
    contentHtml,
    ...data,
    category: normalizeCategories(data.category),
  };
}

/**
 * Holt alle verfügbaren Kategorien
 */
export function getAllCategories(): string[] {
  const posts = getAllPosts();
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
  const allPosts = getAllPosts();
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

