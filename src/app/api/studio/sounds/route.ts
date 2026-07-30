import { NextResponse } from "next/server";
import { auth } from "@/auth";
import fs from "fs";
import path from "path";

export async function GET(req: Request) {
  // Enterprise-Grade Security Check
  const session = await auth();
  const allowedUser = process.env.ALLOWED_GITHUB_USER;
  const allowedEmail = process.env.ALLOWED_GITHUB_EMAIL;
  if (!session?.user || (session.user.name !== allowedUser && session.user.email !== allowedUser && session.user.email !== allowedEmail)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const filePath = path.join(process.cwd(), "content", "sounds.json");
    let sounds = [];
    if (fs.existsSync(filePath)) {
      const fileContents = fs.readFileSync(filePath, "utf8");
      sounds = JSON.parse(fileContents);
    }
    return NextResponse.json({ sounds });
  } catch (error: any) {
    console.error("Error reading sounds content:", error);
    return NextResponse.json({ error: "Failed to load sounds", details: error.message }, { status: 500 });
  }
}
