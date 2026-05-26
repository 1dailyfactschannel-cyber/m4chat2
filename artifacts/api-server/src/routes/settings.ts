import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { userSettingsTable, sessionsTable } from "@workspace/db/schema";
import { eq, and, sql } from "drizzle-orm";

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

// Default settings
const DEFAULT_SETTINGS = {
  notifications: {
    privateChats: true,
    privateSound: true,
    privatePreview: true,
    privateBadge: true,
    groups: true,
    groupSound: false,
    groupPreview: true,
    groupBadge: true,
    channels: true,
    channelSound: false,
    channelPreview: false,
    channelBadge: true,
    countUnread: true,
    includeArchived: false,
  },
  privacy: {
    lastSeen: "Everyone",
    profilePhoto: "Everyone",
    forwardedFrom: "Everyone",
    phoneNumber: "My Contacts",
    calls: "Everyone",
    groupAdd: "My Contacts",
  },
  appearance: {
    theme: "day",
    chatBg: "default",
    fontSize: 15,
    bigEmoji: true,
    bubbles: true,
    animateEmoji: true,
    reduceMotion: false,
    increaseContrast: false,
  },
  language: {
    lang: "English",
    translateMessages: false,
    showTranslateButton: true,
  },
  data: {
    dlPhotoPrivate: true,
    dlVideoPrivate: false,
    dlFilePrivate: false,
    dlPhotoGroup: true,
    dlVideoGroup: false,
    dlFileGroup: false,
    dlPhotoChannel: true,
    dlVideoChannel: false,
    dlFileChannel: false,
    proxyOn: false,
    proxyHost: '',
    proxyPort: '',
    proxyUser: '',
    proxyPass: '',
    roaming: false,
    maxFileSize: 10,
    useLessData: false,
    bytesSent: 0,
    bytesReceived: 0,
  },
};

// Get settings
router.get("/settings", requireAuth, async (req: any, res) => {
  try {
    const userId = req.userId;
    const [settings] = await db
      .select()
      .from(userSettingsTable)
      .where(eq(userSettingsTable.userId, userId));

    if (!settings) {
      // Create default settings
      const [created] = await db
        .insert(userSettingsTable)
        .values({
          userId,
          notifications: DEFAULT_SETTINGS.notifications,
          privacy: DEFAULT_SETTINGS.privacy,
          appearance: DEFAULT_SETTINGS.appearance,
          language: DEFAULT_SETTINGS.language,
          data: DEFAULT_SETTINGS.data,
        })
        .returning();
      return res.json(created);
    }

    res.json(settings);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update settings (partial)
router.put("/settings", requireAuth, async (req: any, res) => {
  try {
    const userId = req.userId;
    const { notifications, privacy, appearance, language, data } = req.body;

    const [existing] = await db
      .select()
      .from(userSettingsTable)
      .where(eq(userSettingsTable.userId, userId));

    if (!existing) {
      // Create with defaults + updates
      const [created] = await db
        .insert(userSettingsTable)
        .values({
          userId,
          notifications: { ...DEFAULT_SETTINGS.notifications, ...notifications },
          privacy: { ...DEFAULT_SETTINGS.privacy, ...privacy },
          appearance: { ...DEFAULT_SETTINGS.appearance, ...appearance },
          language: { ...DEFAULT_SETTINGS.language, ...language },
          data: { ...DEFAULT_SETTINGS.data, ...data },
        })
        .returning();
      return res.json(created);
    }

    const [updated] = await db
      .update(userSettingsTable)
      .set({
        ...(notifications !== undefined ? { notifications: { ...existing.notifications, ...notifications } } : {}),
        ...(privacy !== undefined ? { privacy: { ...existing.privacy, ...privacy } } : {}),
        ...(appearance !== undefined ? { appearance: { ...existing.appearance, ...appearance } } : {}),
        ...(language !== undefined ? { language: { ...existing.language, ...language } } : {}),
        ...(data !== undefined ? { data: { ...existing.data, ...data } } : {}),
        updatedAt: new Date(),
      })
      .where(eq(userSettingsTable.userId, userId))
      .returning();

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
