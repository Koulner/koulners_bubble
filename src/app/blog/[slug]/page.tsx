import { notFound } from "next/navigation";
import { getPostBySlug, getAllPosts, getRelatedPosts } from "@/lib/content";
import BlogPostClient from "@/components/BlogPostClient";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { mdxComponents } from "@/components/mdx/MDXComponents";
import JsonLd from "@/components/seo/JsonLd";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const post = await getPostBySlug(resolvedParams.slug);
  if (!post) {
    return {
      title: "Artikel nicht gefunden | Koulners Bubble",
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://koulners-bubble.de";
  const canonicalUrl = `${siteUrl.replace(/\/$/, "")}/blog/${post.slug}`;
  const categoryStr = Array.isArray(post.category) ? post.category.join(", ") : post.category || "Journal";
  const ogImage = `/api/og?title=${encodeURIComponent(post.title)}&category=${encodeURIComponent(categoryStr)}&author=${encodeURIComponent(post.author || "Koulner")}`;

  return {
    title: `${post.title} | Koulners Bubble`,
    description: post.excerpt || `${post.title} - Ein geschützter Gedankenraum auf Koulners Bubble.`,
    keywords: [
      ...(Array.isArray(post.category) ? post.category : [post.category || "Journal"]),
      "Koulners Bubble",
      "Heilung",
      "Ruhe",
      "Achtsamkeit",
      post.author || "Koulner",
    ],
    authors: [{ name: post.author || "Koulner" }],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt || `${post.title} - Ein geschützter Gedankenraum auf Koulners Bubble.`,
      url: canonicalUrl,
      siteName: "Koulners Bubble",
      locale: "de_DE",
      type: "article",
      publishedTime: post.date,
      authors: [post.author || "Koulner"],
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [ogImage],
    },
  };
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({ params }: Props) {
  const resolvedParams = await params;
  const post = await getPostBySlug(resolvedParams.slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedPosts(post.slug, post.category, 3);

  const mdxContent = (
    <MDXRemote
      source={post.body}
      components={mdxComponents}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [rehypeSlug],
        },
      }}
    />
  );

  return (
    <>
      <JsonLd post={post} />
      <BlogPostClient post={post} relatedPosts={relatedPosts}>
        {mdxContent}
      </BlogPostClient>
    </>
  );
}
