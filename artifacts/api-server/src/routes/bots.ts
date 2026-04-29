import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  botsTable,
  botCommandsTable,
  usersTable,
  chatsTable,
  chatMembersTable,
  messagesTable,
  sessionsTable,
} from "@workspace/db/schema";
import { eq, and, sql } from "drizzle-orm";
import crypto from "crypto";

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

function generateBotToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// ─── Bot Management ─────────────────────────────────────────────────────────

// List my bots
router.get("/bots", requireAuth, async (req: any, res) => {
  try {
    const bots = await db
      .select()
      .from(botsTable)
      .where(eq(botsTable.userId, req.userId));
    res.json(bots);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create bot
router.post("/bots", requireAuth, async (req: any, res) => {
  try {
    const userId = req.userId;
    const { username, name, description } = req.body;

    if (!username || !name) {
      return res.status(400).json({ error: "username and name are required" });
    }

    const cleanUsername = username.replace(/^@/, "").toLowerCase();
    if (!/^[a-z0-9_]{3,100}$/.test(cleanUsername)) {
      return res.status(400).json({ error: "Invalid username format" });
    }

    // Check if bot username is available
    const [existing] = await db
      .select()
      .from(botsTable)
      .where(eq(botsTable.username, cleanUsername));
    if (existing) {
      return res.status(409).json({ error: "Username already taken" });
    }

    // Check if user username doesn't conflict
    const [existingUser] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.username, cleanUsername));
    if (existingUser) {
      return res.status(409).json({ error: "Username already taken" });
    }

    const token = generateBotToken();
    const [bot] = await db
      .insert(botsTable)
      .values({
        userId,
        username: cleanUsername,
        name: name.slice(0, 255),
        token,
        description: description || null,
      })
      .returning();

    res.status(201).json(bot);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete bot
router.delete("/bots/:botId", requireAuth, async (req: any, res) => {
  try {
    const { botId } = req.params;
    const [bot] = await db
      .select()
      .from(botsTable)
      .where(eq(botsTable.id, Number(botId)));

    if (!bot) return res.status(404).json({ error: "Bot not found" });
    if (bot.userId !== req.userId) return res.status(403).json({ error: "Not authorized" });

    await db.delete(botsTable).where(eq(botsTable.id, Number(botId)));
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update bot
router.put("/bots/:botId", requireAuth, async (req: any, res) => {
  try {
    const { botId } = req.params;
    const { name, description, avatarUrl, webhookUrl, isActive } = req.body;

    const [bot] = await db
      .select()
      .from(botsTable)
      .where(eq(botsTable.id, Number(botId)));

    if (!bot) return res.status(404).json({ error: "Bot not found" });
    if (bot.userId !== req.userId) return res.status(403).json({ error: "Not authorized" });

    const [updated] = await db
      .update(botsTable)
      .set({
        ...(name !== undefined ? { name: name.slice(0, 255) } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(avatarUrl !== undefined ? { avatarUrl: avatarUrl.slice(0, 500) } : {}),
        ...(webhookUrl !== undefined ? { webhookUrl: webhookUrl.slice(0, 1000) } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
        updatedAt: new Date(),
      })
      .where(eq(botsTable.id, Number(botId)))
      .returning();

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Regenerate token
router.post("/bots/:botId/regenerate-token", requireAuth, async (req: any, res) => {
  try {
    const { botId } = req.params;
    const [bot] = await db
      .select()
      .from(botsTable)
      .where(eq(botsTable.id, Number(botId)));

    if (!bot) return res.status(404).json({ error: "Bot not found" });
    if (bot.userId !== req.userId) return res.status(403).json({ error: "Not authorized" });

    const newToken = generateBotToken();
    const [updated] = await db
      .update(botsTable)
      .set({ token: newToken, updatedAt: new Date() })
      .where(eq(botsTable.id, Number(botId)))
      .returning();

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Bot Commands ───────────────────────────────────────────────────────────

// Get commands for a bot
router.get("/bots/:botId/commands", async (req: any, res) => {
  try {
    const { botId } = req.params;
    const commands = await db
      .select()
      .from(botCommandsTable)
      .where(eq(botCommandsTable.botId, Number(botId)))
      .orderBy(botCommandsTable.command);

    res.json(commands);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Set commands (replace all)
router.post("/bots/:botId/commands", requireAuth, async (req: any, res) => {
  try {
    const { botId } = req.params;
    const { commands } = req.body as { commands: { command: string; description: string }[] };

    const [bot] = await db
      .select()
      .from(botsTable)
      .where(eq(botsTable.id, Number(botId)));

    if (!bot) return res.status(404).json({ error: "Bot not found" });
    if (bot.userId !== req.userId) return res.status(403).json({ error: "Not authorized" });

    // Delete existing commands
    await db.delete(botCommandsTable).where(eq(botCommandsTable.botId, Number(botId)));

    // Insert new commands
    if (commands && commands.length > 0) {
      const values = commands
        .filter((c) => c.command && c.description)
        .map((c) => ({
          botId: Number(botId),
          command: c.command.replace(/^\//, "").slice(0, 100),
          description: c.description.slice(0, 255),
        }));

      if (values.length > 0) {
        await db.insert(botCommandsTable).values(values);
      }
    }

    const newCommands = await db
      .select()
      .from(botCommandsTable)
      .where(eq(botCommandsTable.botId, Number(botId)))
      .orderBy(botCommandsTable.command);

    res.json(newCommands);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Webhook / Bot API style ────────────────────────────────────────────────

// Webhook endpoint — receives updates when user sends message to bot
// In a real implementation, this would be called by external services.
// For our internal bots, we simulate by calling this when a message starts with /
router.post("/bot/:token", async (req: any, res) => {
  try {
    const { token } = req.params;
    const update = req.body;

    const [bot] = await db
      .select()
      .from(botsTable)
      .where(eq(botsTable.token, token));

    if (!bot) return res.status(404).json({ error: "Bot not found" });
    if (!bot.isActive) return res.status(403).json({ error: "Bot is disabled" });

    // Acknowledge webhook
    res.json({ ok: true });

    // If there's a webhookUrl configured, forward the update
    if (bot.webhookUrl) {
      try {
        fetch(bot.webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(update),
        }).catch((err) => console.error("Webhook forward failed:", err));
      } catch {
        // ignore
      }
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Bot sends message (Bot API style)
router.post("/bot/:token/sendMessage", async (req: any, res) => {
  try {
    const { token } = req.params;
    const { chatId, text, messageType = "text", mediaUrl } = req.body;

    if (!chatId || !text) {
      return res.status(400).json({ error: "chatId and text are required" });
    }

    const [bot] = await db
      .select()
      .from(botsTable)
      .where(eq(botsTable.token, token));

    if (!bot) return res.status(404).json({ error: "Bot not found" });
    if (!bot.isActive) return res.status(403).json({ error: "Bot is disabled" });

    // Find or create a user row for the bot so it can be a sender
    let [botUser] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.username, bot.username));

    if (!botUser) {
      [botUser] = await db
        .insert(usersTable)
        .values({
          username: bot.username,
          passwordHash: "",
          avatarUrl: bot.avatarUrl,
        })
        .returning();
    }

    // Verify bot is member of chat
    const [membership] = await db
      .select()
      .from(chatMembersTable)
      .where(
        and(
          eq(chatMembersTable.chatId, Number(chatId)),
          eq(chatMembersTable.userId, botUser.id)
        )
      );

    // Auto-join bot to chat if not member
    if (!membership) {
      await db.insert(chatMembersTable).values({
        chatId: Number(chatId),
        userId: botUser.id,
        role: "member",
      });
    }

    const [message] = await db
      .insert(messagesTable)
      .values({
        chatId: Number(chatId),
        senderId: botUser.id,
        content: text,
        messageType: messageType || "text",
        mediaUrl: mediaUrl || null,
      })
      .returning();

    const io = req.app.get("io");
    if (io) {
      io.to(`chat:${chatId}`).emit("message:new", {
        ...message,
        senderName: bot.name,
        senderAvatar: bot.avatarUrl,
        reactions: [],
      });
    }

    res.json({ ok: true, result: message });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get bot info by username (public)
router.get("/bots/username/:username", async (req: any, res) => {
  try {
    const { username } = req.params;
    const [bot] = await db
      .select({
        id: botsTable.id,
        username: botsTable.username,
        name: botsTable.name,
        description: botsTable.description,
        avatarUrl: botsTable.avatarUrl,
        createdAt: botsTable.createdAt,
      })
      .from(botsTable)
      .where(eq(botsTable.username, username.toLowerCase()));

    if (!bot) return res.status(404).json({ error: "Bot not found" });
    res.json(bot);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
