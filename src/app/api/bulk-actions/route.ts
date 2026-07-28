import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getRawPostBySlug, saveLocalPost } from "@/lib/content";
import { Octokit } from "@octokit/rest";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  // 1. Enterprise-Grade Security Check (Crucial Whitelist Session Verification)
  const session = await auth();
  if (!session?.user) {
    console.warn("[BULK ACTIONS BLOCKED] Unauthorized attempt without valid whitelist session.");
    return NextResponse.json(
      { error: "Unauthorized: Active whitelisted session required for bulk actions." },
      { status: 401 }
    );
  }

  try {
    const { slugs, action } = await req.json();

    if (!Array.isArray(slugs) || slugs.length === 0 || !action) {
      return NextResponse.json({ error: "Invalid parameters: slugs array and action required." }, { status: 400 });
    }

    if (!["draft", "publish", "archive", "delete"].includes(action)) {
      return NextResponse.json({ error: "Invalid action specified." }, { status: 400 });
    }

    const token = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;
    const owner = process.env.GITHUB_REPO_OWNER || "lukas";
    const repo = process.env.GITHUB_REPO_NAME || "koulners_bubble";
    const octokit = token ? new Octokit({ auth: token }) : null;

    const results: { slug: string; status: "success" | "error"; message?: string }[] = [];

    // Sequenzielle Bearbeitung um 409-Branches/Commit-Konflikte bei GitHub zu vermeiden
    for (const slug of slugs) {
      try {
        if (action === "delete") {
          // 1. Lokal löschen
          const pathsToDeleteLocal = [
            path.join(process.cwd(), "content", "blog", `${slug}.md`),
            path.join(process.cwd(), "content", "blog", `${slug}.mdx`),
            path.join(process.cwd(), "content", `${slug}.md`),
            path.join(process.cwd(), "content", `${slug}.mdx`),
          ];
          for (const p of pathsToDeleteLocal) {
            if (fs.existsSync(p)) {
              fs.unlinkSync(p);
            }
          }

          // 2. GitOps via GitHub REST API löschen
          if (octokit) {
            const remotePaths = [`content/blog/${slug}.md`, `content/blog/${slug}.mdx`, `content/${slug}.md`];
            for (const filePath of remotePaths) {
              try {
                const { data } = await octokit.rest.repos.getContent({
                  owner,
                  repo,
                  path: filePath,
                });
                if (data && !Array.isArray(data) && "sha" in data) {
                  await octokit.rest.repos.deleteFile({
                    owner,
                    repo,
                    path: filePath,
                    message: `chore(studio): bulk delete ${slug} via Bubble Studio [GitOps]`,
                    sha: data.sha,
                    committer: {
                      name: session.user.name || "Bubble Studio GitOps Bot",
                      email: session.user.email || "studio@koulners-bubble.local",
                    },
                  });
                }
              } catch (err: any) {
                if (err.status !== 404) {
                  console.warn(`[BULK DELETE GITOPS WARNING] Could not delete ${filePath}:`, err.message);
                }
              }
            }
          }

          results.push({ slug, status: "success", message: "Erfolgreich gelöscht." });
        } else {
          // Statusänderung (draft, publish, archive)
          const post = getRawPostBySlug(slug);
          if (!post) {
            results.push({ slug, status: "error", message: "Artikel lokal nicht gefunden." });
            continue;
          }

          let updatedContent = post.rawContent;

          if (action === "draft") {
            // draft: true setzen
            if (/^draft:\s*.+/m.test(updatedContent)) {
              updatedContent = updatedContent.replace(/^draft:\s*.+/m, "draft: true");
            } else {
              updatedContent = updatedContent.replace(/^---(\r?\n)/, "---$1draft: true$1");
            }
            // archived: false setzen oder entfernen
            if (/^archived:\s*.+/m.test(updatedContent)) {
              updatedContent = updatedContent.replace(/^archived:\s*.+/m, "archived: false");
            }
          } else if (action === "publish") {
            // draft: false und archived: false setzen
            if (/^draft:\s*.+/m.test(updatedContent)) {
              updatedContent = updatedContent.replace(/^draft:\s*.+/m, "draft: false");
            } else {
              updatedContent = updatedContent.replace(/^---(\r?\n)/, "---$1draft: false$1");
            }
            if (/^archived:\s*.+/m.test(updatedContent)) {
              updatedContent = updatedContent.replace(/^archived:\s*.+/m, "archived: false");
            } else {
              updatedContent = updatedContent.replace(/^---(\r?\n)/, "---$1archived: false$1");
            }
          } else if (action === "archive") {
            // archived: true und draft: false setzen
            if (/^archived:\s*.+/m.test(updatedContent)) {
              updatedContent = updatedContent.replace(/^archived:\s*.+/m, "archived: true");
            } else {
              updatedContent = updatedContent.replace(/^---(\r?\n)/, "---$1archived: true$1");
            }
            if (/^draft:\s*.+/m.test(updatedContent)) {
              updatedContent = updatedContent.replace(/^draft:\s*.+/m, "draft: false");
            }
          }

          // 1. Lokal synchron speichern
          saveLocalPost(slug, updatedContent);

          // 2. GitOps Remote Commit
          if (octokit) {
            const pathsToUpdate = [`content/blog/${slug}.md`, `content/${slug}.md`];
            const base64Content = Buffer.from(updatedContent, "utf8").toString("base64");
            const actionMsg =
              action === "draft"
                ? "mark as draft"
                : action === "publish"
                ? "publish article"
                : "archive article";

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
                  console.warn(`[BULK GITOPS WARNING] Could not fetch sha for ${filePath}:`, err.message);
                }
              }

              try {
                await octokit.rest.repos.createOrUpdateFileContents({
                  owner,
                  repo,
                  path: filePath,
                  message: `chore(studio): bulk ${actionMsg} (${slug}) [GitOps]`,
                  content: base64Content,
                  sha,
                  committer: {
                    name: session.user.name || "Bubble Studio GitOps Bot",
                    email: session.user.email || "studio@koulners-bubble.local",
                  },
                });
              } catch (err: any) {
                console.error(`[BULK GITOPS ERROR] Could not update ${filePath}:`, err.message);
              }
            }
          }

          results.push({ slug, status: "success", message: `Erfolgreich ausgeführt: ${action}` });
        }
      } catch (err: any) {
        console.error(`[BULK ACTION ERROR for ${slug}]:`, err);
        results.push({ slug, status: "error", message: err?.message || "Fehler bei Verarbeitung" });
      }
    }

    return NextResponse.json({
      success: true,
      gitOps: Boolean(octokit),
      results,
      message: `Bulk Action "${action}" abgeschlossen (${slugs.length} Artikel).`,
    });
  } catch (error: any) {
    console.error("[BULK ACTIONS API ERROR]", error);
    return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}
