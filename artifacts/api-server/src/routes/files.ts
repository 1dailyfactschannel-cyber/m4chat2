import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { filesTable, sessionsTable, chatsTable } from "@workspace/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { uploadSingle } from "../middleware/upload";
import { uploadFile, S3_BUCKET, s3 } from "../lib/s3";
import fs from "fs";
import path from "path";

const router: IRouter = Router();

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

    // Clean up local temp file
    fs.unlinkSync(file.path);

    res.status(201).json(fileRecord);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
