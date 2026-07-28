import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  // 1. Enterprise-Grade Security Check (Crucial Whitelist Session Verification)
  const session = await auth();
  if (!session?.user) {
    console.warn("[UPLOAD BLOCKED] Unauthorized attempt without valid whitelist session.");
    return NextResponse.json(
      { error: "Unauthorized: Active whitelisted session required for file upload." },
      { status: 401 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded in form data under key 'file'." }, { status: 400 });
    }

    // Validate file type (Images)
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type: ${file.type}. Allowed types: png, jpg, webp, gif, svg.` },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create unique safe filename
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = `${timestamp}-${safeName}`;

    // S3 Environment Configuration
    const s3Endpoint = process.env.S3_ENDPOINT;
    const s3Region = process.env.S3_REGION || "us-east-1";
    const s3AccessKey = process.env.S3_ACCESS_KEY;
    const s3SecretKey = process.env.S3_SECRET_KEY;
    const s3Bucket = process.env.S3_BUCKET_NAME || "koulners-bubble-media";
    const s3PublicUrl = process.env.S3_PUBLIC_URL;

    // Check if S3 credentials are provided
    if (s3AccessKey && s3SecretKey) {
      console.log(`[S3 UPLOAD] Uploading ${fileName} to bucket '${s3Bucket}' via S3 client...`);

      const s3Client = new S3Client({
        endpoint: s3Endpoint || undefined,
        region: s3Region,
        credentials: {
          accessKeyId: s3AccessKey,
          secretAccessKey: s3SecretKey,
        },
        forcePathStyle: true, // Crucial for MinIO and self-hosted S3 storage
      });

      const command = new PutObjectCommand({
        Bucket: s3Bucket,
        Key: fileName,
        Body: buffer,
        ContentType: file.type,
      });

      await s3Client.send(command);

      // Determine final public URL
      let publicUrl: string;
      if (s3PublicUrl) {
        const baseUrl = s3PublicUrl.replace(/\/$/, "");
        publicUrl = `${baseUrl}/${fileName}`;
      } else if (s3Endpoint) {
        const baseUrl = s3Endpoint.replace(/\/$/, "");
        publicUrl = `${baseUrl}/${s3Bucket}/${fileName}`;
      } else {
        publicUrl = `https://${s3Bucket}.s3.${s3Region}.amazonaws.com/${fileName}`;
      }

      console.log(`[S3 UPLOAD SUCCESS] Public URL: ${publicUrl}`);
      return NextResponse.json({
        success: true,
        url: publicUrl,
        fileName,
        storage: "s3",
      });
    } else {
      // Local development fallback if S3 credentials are not configured in environment
      console.warn("[S3 UPLOAD NOTICE] S3_ACCESS_KEY or S3_SECRET_KEY not set. Using local development fallback (/public/uploads).");
      
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, fileName);
      fs.writeFileSync(filePath, buffer);

      const publicUrl = `/uploads/${fileName}`;
      console.log(`[LOCAL UPLOAD SUCCESS] Public URL: ${publicUrl}`);
      
      return NextResponse.json({
        success: true,
        url: publicUrl,
        fileName,
        storage: "local-fallback",
      });
    }
  } catch (error: any) {
    console.error("[UPLOAD API ERROR]", error);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error during file upload." },
      { status: 500 }
    );
  }
}
