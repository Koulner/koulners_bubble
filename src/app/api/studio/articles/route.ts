import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getAllPosts, getRawPostBySlug } from "@/lib/content";

export async function GET(req: Request) {
  // Enterprise-Grade Security Check (Server-side Session Verify)
  const session = await auth();
  if (!session?.user || session.user.email !== process.env.ALLOWED_GITHUB_USER) {
    return NextResponse.json({ error: "Unauthorized: Active whitelisted session required." }, { status: 401 });
  }

  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");

  if (slug) {
    const post = getRawPostBySlug(slug);
    if (!post) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }
    return NextResponse.json({ post });
  }

  // Holt alle Artikel (inklusive Entwürfe / drafts und archivierte Beiträge)
  const posts = getAllPosts(true, true);
  return NextResponse.json({ posts });
}
