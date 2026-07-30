import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getAvailableCategories, saveAvailableCategories } from "@/lib/categories";
import { Octokit } from "@octokit/rest";

export async function GET() {
  try {
    const categories = getAvailableCategories();
    return NextResponse.json({ success: true, categories });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Error fetching categories" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  const allowedUser = process.env.ALLOWED_GITHUB_USER;
  const allowedEmail = process.env.ALLOWED_GITHUB_EMAIL;
  if (!session?.user || (session.user.name !== allowedUser && session.user.email !== allowedUser && session.user.email !== allowedEmail)) {
    return NextResponse.json(
      { error: "Unauthorized: Active whitelisted session required." },
      { status: 401 }
    );
  }

  try {
    const { categories } = await req.json();
    if (!Array.isArray(categories)) {
      return NextResponse.json({ error: "categories must be an array of strings" }, { status: 400 });
    }

    const cleaned = Array.from(new Set(categories.map((c) => String(c).trim()).filter(Boolean)));
    const savedLocally = saveAvailableCategories(cleaned);

    const token = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;
    const owner = process.env.GITHUB_REPO_OWNER || "lukas";
    const repo = process.env.GITHUB_REPO_NAME || "koulners_bubble";

    if (!token) {
      return NextResponse.json({
        success: true,
        categories: cleaned,
        gitOps: false,
        message: "Kategorien lokal gespeichert (kein GitHub Token aktiv).",
      });
    }

    const octokit = new Octokit({ auth: token });
    const filePath = "content/categories.json";
    const contentString = JSON.stringify(cleaned, null, 2);
    const base64Content = Buffer.from(contentString, "utf8").toString("base64");

    let sha: string | undefined = undefined;
    try {
      const { data } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: filePath,
      });
      if (data && !Array.isArray(data) && "sha" in data) {
        sha = data.sha;
      }
    } catch (err: any) {
      if (err.status !== 404) {
        console.warn(`[GITOPS] Error fetching sha for ${filePath}:`, err.message);
      }
    }

    await octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: filePath,
      message: "chore(studio): update available categories via Bubble Studio [GitOps]",
      content: base64Content,
      sha,
      committer: {
        name: session.user.name || "Bubble Studio GitOps Bot",
        email: session.user.email || "studio@koulners-bubble.local",
      },
    });

    return NextResponse.json({
      success: true,
      categories: cleaned,
      gitOps: true,
      message: "Kategorien erfolgreich gespeichert und via GitOps auf GitHub gepusht!",
    });
  } catch (error: any) {
    console.error("[SAVE CATEGORIES ERROR]", error);
    return NextResponse.json({ error: error?.message || "Error saving categories" }, { status: 500 });
  }
}
