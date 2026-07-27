import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

const contentDirectory = path.join(process.cwd(), "content/blog");

export interface BlogPostMeta {
  slug: string;
  title: string;
  date: string;
  category: "Natur" | "Philosophie" | "Ganzheitliche Gesundheit" | "DIY Kosmetik" | "Ernährung" | "Frequenzen" | "Funktionelles Training" | string;
  excerpt: string;
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

      return {
        slug,
        ...(matterResult.data as Omit<BlogPostMeta, "slug">),
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
    .use(html, { sanitize: false })
    .process(matterResult.content);
  const contentHtml = processedContent.toString();

  return {
    slug,
    contentHtml,
    ...(matterResult.data as Omit<BlogPostMeta, "slug">),
  };
}

/**
 * Holt alle verfügbaren Kategorien
 */
export function getAllCategories(): string[] {
  const posts = getAllPosts();
  const categories = new Set<string>();
  posts.forEach((post) => {
    if (post.category) {
      categories.add(post.category);
    }
  });
  return Array.from(categories);
}
