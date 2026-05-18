import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { filesTable, sessionsTable, chatsTable } from "@workspace/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { uploadSingle } from "../middleware/upload";
import { uploadFile, getPresignedUrl, S3_BUCKET, s3 } from "../lib/s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";
import fs from "fs";
import path from "path";

const router: IRouter = Router();

const DOWNLOAD_SECRET = process.env.JWT_SECRET || "m4chat-download-secret";

function signFileToken(fileId: number): string {
  const hmac = crypto.createHmac("sha256", DOWNLOAD_SECRET);
  hmac.update(String(fileId));
  return hmac.digest("hex");
}

function verifyFileToken(fileId: number, token: string): boolean {
  return token === signFileToken(fileId);
}

async function requireAuth(req: any, res: any, next: any) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  const [session] = await db
    .select()
    .from(sessionsTable)
    .where(
      and(
        eq(sessionsTable.token, token),
        sql`${sessionsTable.expiresAt} > NOW()`
      )
    );

  if (!session) return res.status(401).json({ error: "Invalid session" });
  req.userId = session.userId;
  next();
}

// Upload file
router.post("/files/upload", requireAuth, uploadSingle, async (req: any, res) => {
  try {
    const userId = req.userId;
    const chatId = req.body.chatId ? Number(req.body.chatId) : null;

    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }

    const file = req.file;
    const fileKey = `uploads/${Date.now()}-${path.basename(file.filename)}`;
    const fileBuffer = fs.readFileSync(file.path);

    // Upload to RustFS/S3
    const url = await uploadFile(fileKey, fileBuffer, file.mimetype);

    // Save to DB
    const [fileRecord] = await db
      .insert(filesTable)
      .values({
        chatId,
        uploaderId: userId,
        fileKey,
        fileName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url,
      })
      .returning();

    // Return proxy download URL with signed token (works in <img> tags)
    const token = signFileToken(fileRecord.id);
    fileRecord.url = `/api/files/download/${fileRecord.id}?token=${token}`;

    // Clean up local temp file
    fs.unlinkSync(file.path);

    res.status(201).json(fileRecord);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Download file by ID — proxies from S3 with fresh presigned URL
router.get("/files/download/:id", async (req: any, res) => {
  try {
    const fileId = Number(req.params.id);
    const token = req.query.token as string;

    if (!token || !verifyFileToken(fileId, token)) {
      return res.status(403).json({ error: "Invalid or missing download token" });
    }

    const [file] = await db.select().from(filesTable).where(eq(filesTable.id, fileId));
    if (!file) return res.status(404).json({ error: "File not found" });

    const presignedUrl = await getPresignedUrl(file.fileKey);
    const response = await fetch(presignedUrl);

    if (!response.ok) {
      return res.status(500).json({ error: "Failed to fetch file from storage" });
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    res.setHeader("Content-Type", file.mimeType || "application/octet-stream");
    res.setHeader("Content-Disposition", `inline; filename="${file.fileName || "file"}"`);
    res.setHeader("Content-Length", buffer.length);
    res.send(buffer);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
