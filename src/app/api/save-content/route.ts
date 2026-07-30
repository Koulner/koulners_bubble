import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { saveLocalPost } from "@/lib/content";
import { Octokit } from "@octokit/rest";

export async function POST(req: Request) {
  // 1. Enterprise-Grade Security Check (Crucial Whitelist Session Verification)
  const session = await auth();
  const allowedUser = process.env.ALLOWED_GITHUB_USER;
  const allowedEmail = process.env.ALLOWED_GITHUB_EMAIL;
  if (!session?.user || (session.user.name !== allowedUser && session.user.email !== allowedUser && session.user.email !== allowedEmail)) {
    console.warn("[GITOPS BLOCKED] Unauthorized save attempt without valid whitelist session.");
    return NextResponse.json(
      { error: "Unauthorized: Active whitelisted session required for GitOps saving." },
      { status: 401 }
    );
  }

  try {
    const { slug, rawContent, commitMessage } = await req.json();

    if (!slug || !rawContent) {
      return NextResponse.json({ error: "Missing slug or rawContent" }, { status: 400 });
    }

    // 2. Lokales Speichern (für Sofort-Vorschau und lokale Dev-Umgebung)
    try {
      saveLocalPost(slug, rawContent);
      console.log(`[LOCAL SAVE] Successfully written ${slug}.md to disk.`);
    } catch (err) {
      console.warn("[LOCAL SAVE WARNING] Could not write to local disk (e.g. read-only serverless environment):", err);
    }

    // 3. GitOps Push via GitHub REST API (wenn Token konfiguriert ist)
    const token = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;
    const owner = process.env.GITHUB_REPO_OWNER || "lukas";
    const repo = process.env.GITHUB_REPO_NAME || "koulners_bubble";

    if (!token) {
      console.warn("[GITOPS] No GITHUB_PERSONAL_ACCESS_TOKEN present. Saved locally only.");
      return NextResponse.json({
        success: true,
        gitOps: false,
        message: "Artikel lokal gespeichert (kein GitHub Token für Remote-Commit konfiguriert).",
      });
    }

    const octokit = new Octokit({ auth: token });
    const pathsToUpdate = [`content/blog/${slug}.md`, `content/${slug}.md`];
    const base64Content = Buffer.from(rawContent, "utf8").toString("base64");
    const defaultMsg = commitMessage || `chore(studio): update article ${slug} via Bubble Studio [GitOps]`;

    const results = [];

    for (const filePath of pathsToUpdate) {
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

      try {
        const response = await octokit.rest.repos.createOrUpdateFileContents({
          owner,
          repo,
          path: filePath,
          message: defaultMsg,
          content: base64Content,
          sha,
          committer: {
            name: session.user.name || "Bubble Studio GitOps Bot",
            email: session.user.email || "studio@koulners-bubble.local",
          },
        });
        results.push({ path: filePath, commit: response.data.commit.html_url });
      } catch (err: any) {
        console.error(`[GITOPS ERROR] Could not commit ${filePath}:`, err.message);
      }
    }

    return NextResponse.json({
      success: true,
      gitOps: true,
      results,
      message: "Erfolgreich gespeichert und via GitOps auf GitHub gepusht!",
    });
  } catch (error: any) {
    console.error("[SAVE CONTENT ERROR]", error);
    return NextResponse.json({ error: error?.message || "Internal GitOps Save Error" }, { status: 500 });
  }
}
