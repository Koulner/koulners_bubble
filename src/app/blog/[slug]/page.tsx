import { notFound } from "next/navigation";
import { getPostBySlug, getAllPosts, getRelatedPosts } from "@/lib/content";
import BlogPostClient from "@/components/BlogPostClient";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { mdxComponents } from "@/components/mdx/MDXComponents";
import { JsonLd } from "@/components/seo/JsonLd";

interface Props {
  params: Promise<{ slug: string }>;
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://koulnersbubble.de";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const post = await getPostBySlug(resolvedParams.slug);
  if (!post) {
    return {
      title: "Artikel nicht gefunden | Koulners Bubble",
      description: "Der angefragte Gedankenraum existiert nicht oder wurde verschoben.",
    };
  }

  const articleUrl = `${siteUrl}/blog/${post.slug}`;
  const ogImageUrl = `${siteUrl}/api/og?title=${encodeURIComponent(post.title)}&category=${encodeURIComponent(
    post.category
  )}&author=${encodeURIComponent(post.author || "Koulner")}&date=${encodeURIComponent(post.date)}`;

  const keywords = [
    post.category,
    "Koulners Bubble",
    "Achtsamkeit",
    "Holistische Gesundheit",
    "Philosophie",
    "Ruhe",
    ...post.title.split(" ").filter((w) => w.length > 4),
  ];

  return {
    metadataBase: new URL(siteUrl),
    title: `${post.title} | Koulners Bubble`,
    description: post.excerpt,
    keywords: keywords,
    alternates: {
      canonical: articleUrl,
    },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: articleUrl,
      siteName: "Koulners Bubble",
      publishedTime: post.date,
      authors: [post.author || "Koulner"],
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${post.title} – Koulners Bubble`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [ogImageUrl],
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
  const articleUrl = `${siteUrl}/blog/${post.slug}`;

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
      <JsonLd post={post} url={articleUrl} siteUrl={siteUrl} />
      <BlogPostClient post={post} relatedPosts={relatedPosts}>
        {mdxContent}
      </BlogPostClient>
    </>
  );
}
