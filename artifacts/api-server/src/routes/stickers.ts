import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  stickerPacksTable,
  stickersTable,
  sessionsTable,
  usersTable,
} from "@workspace/db/schema";
import { eq, and, sql, desc } from "drizzle-orm";

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

// Get all sticker packs for current user
router.get("/sticker-packs", requireAuth, async (req: any, res) => {
  try {
    const userId = req.userId;
    const packs = await db
      .select()
      .from(stickerPacksTable)
      .where(eq(stickerPacksTable.createdBy, userId))
      .orderBy(desc(stickerPacksTable.updatedAt));

    res.json(packs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create sticker pack
router.post("/sticker-packs", requireAuth, async (req: any, res) => {
  try {
    const userId = req.userId;
    const { name, thumbnail } = req.body;

    if (!name || typeof name !== "string") {
      return res.status(400).json({ error: "Name is required" });
    }

    const [pack] = await db
      .insert(stickerPacksTable)
      .values({
        name: name.slice(0, 255),
        thumbnail: thumbnail || null,
        createdBy: userId,
      })
      .returning();

    res.status(201).json(pack);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete sticker pack
router.delete("/sticker-packs/:packId", requireAuth, async (req: any, res) => {
  try {
    const userId = req.userId;
    const { packId } = req.params;

    const [pack] = await db
      .select()
      .from(stickerPacksTable)
      .where(eq(stickerPacksTable.id, Number(packId)));

    if (!pack) return res.status(404).json({ error: "Pack not found" });
    if (pack.createdBy !== userId) return res.status(403).json({ error: "Not authorized" });

    await db.delete(stickerPacksTable).where(eq(stickerPacksTable.id, Number(packId)));
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get stickers in a pack
router.get("/sticker-packs/:packId/stickers", requireAuth, async (req: any, res) => {
  try {
    const { packId } = req.params;
    const stickers = await db
      .select()
      .from(stickersTable)
      .where(eq(stickersTable.packId, Number(packId)))
      .orderBy(stickersTable.id);

    res.json(stickers);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Add sticker to pack
router.post("/sticker-packs/:packId/stickers", requireAuth, async (req: any, res) => {
  try {
    const userId = req.userId;
    const { packId } = req.params;
    const { emoji, imageUrl } = req.body;

    if (!emoji || !imageUrl) {
      return res.status(400).json({ error: "emoji and imageUrl are required" });
    }

    const [pack] = await db
      .select()
      .from(stickerPacksTable)
      .where(eq(stickerPacksTable.id, Number(packId)));

    if (!pack) return res.status(404).json({ error: "Pack not found" });
    if (pack.createdBy !== userId) return res.status(403).json({ error: "Not authorized" });

    const [sticker] = await db
      .insert(stickersTable)
      .values({
        packId: Number(packId),
        emoji: emoji.slice(0, 50),
        imageUrl: imageUrl.slice(0, 1000),
      })
      .returning();

    // Update pack timestamp
    await db
      .update(stickerPacksTable)
      .set({ updatedAt: new Date() })
      .where(eq(stickerPacksTable.id, Number(packId)));

    res.status(201).json(sticker);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete sticker
router.delete("/stickers/:stickerId", requireAuth, async (req: any, res) => {
  try {
    const userId = req.userId;
    const { stickerId } = req.params;

    const [sticker] = await db
      .select()
      .from(stickersTable)
      .where(eq(stickersTable.id, Number(stickerId)));

    if (!sticker) return res.status(404).json({ error: "Sticker not found" });

    const [pack] = await db
      .select()
      .from(stickerPacksTable)
      .where(eq(stickerPacksTable.id, sticker.packId));

    if (!pack || pack.createdBy !== userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    await db.delete(stickersTable).where(eq(stickersTable.id, Number(stickerId)));
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get recent stickers (last 20 used by user) — simplified: returns all stickers from user's packs for now
router.get("/stickers/recent", requireAuth, async (req: any, res) => {
  try {
    const userId = req.userId;
    const packs = await db
      .select({ id: stickerPacksTable.id })
      .from(stickerPacksTable)
      .where(eq(stickerPacksTable.createdBy, userId));

    if (packs.length === 0) {
      return res.json([]);
    }

    const packIds = packs.map((p) => p.id);
    // Since we can't do IN with drizzle eq easily without or, fetch per pack and merge
    const allStickers: any[] = [];
    for (const packId of packIds.slice(0, 10)) {
      const stickers = await db
        .select()
        .from(stickersTable)
        .where(eq(stickersTable.packId, packId))
        .limit(50);
      allStickers.push(...stickers);
    }

    res.json(allStickers.slice(0, 100));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
