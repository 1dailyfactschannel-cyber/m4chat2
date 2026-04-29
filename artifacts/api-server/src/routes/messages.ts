import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  usersTable,
  chatsTable,
  chatMembersTable,
  messagesTable,
  messageReadsTable,
  sessionsTable,
  reactionsTable,
} from "@workspace/db/schema";
import { eq, and, desc, sql, count } from "drizzle-orm";
import { parseMarkdown } from "../lib/parseMarkdown.js";

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

// Get messages for a chat
router.get("/chats/:chatId/messages", requireAuth, async (req: any, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.userId;
    const limit = Number(req.query.limit) || 50;
    const offset = Number(req.query.offset) || 0;

    const [membership] = await db
      .select()
      .from(chatMembersTable)
      .where(
        and(
          eq(chatMembersTable.chatId, Number(chatId)),
          eq(chatMembersTable.userId, userId)
        )
      );

    if (!membership) {
      return res.status(403).json({ error: "Not a member of this chat" });
    }

    const messages = await db
      .select({
        id: messagesTable.id,
        chatId: messagesTable.chatId,
        senderId: messagesTable.senderId,
        content: messagesTable.content,
        entities: messagesTable.entities,
        messageType: messagesTable.messageType,
        mediaUrl: messagesTable.mediaUrl,
        replyTo: messagesTable.replyTo,
        isEdited: messagesTable.isEdited,
        isDeleted: messagesTable.isDeleted,
        createdAt: messagesTable.createdAt,
      })
      .from(messagesTable)
      .where(
        and(
          eq(messagesTable.chatId, Number(chatId)),
          eq(messagesTable.isDeleted, false)
        )
      )
      .orderBy(desc(messagesTable.createdAt))
      .limit(limit)
      .offset(offset);

    // Fetch sender info and reactions for each message
    const messagesWithDetails = await Promise.all(
      messages.map(async (msg) => {
        const [sender] = msg.senderId
          ? await db
              .select({ username: usersTable.username, avatarUrl: usersTable.avatarUrl })
              .from(usersTable)
              .where(eq(usersTable.id, msg.senderId))
          : [];

        const reactions = await db
          .select({
            emoji: reactionsTable.emoji,
            count: sql<number>`COUNT(*)`,
          })
          .from(reactionsTable)
          .where(eq(reactionsTable.messageId, msg.id))
          .groupBy(reactionsTable.emoji);

        const myReactions = await db
          .select({ emoji: reactionsTable.emoji })
          .from(reactionsTable)
          .where(
            and(
              eq(reactionsTable.messageId, msg.id),
              eq(reactionsTable.userId, userId)
            )
          );

        const reactionList = reactions.map((r) => ({
          emoji: r.emoji,
          count: Number(r.count),
          mine: myReactions.some((mr) => mr.emoji === r.emoji),
        }));

        // Mark as read
        if (msg.senderId !== userId) {
          await db
            .insert(messageReadsTable)
            .values({ messageId: msg.id, userId })
            .onConflictDoNothing();
        }

        return {
          ...msg,
          senderName: sender?.username || "Unknown",
          senderAvatar: sender?.avatarUrl,
          reactions: reactionList,
        };
      })
    );

    res.json(messagesWithDetails.reverse());
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Send message
router.post("/chats/:chatId/messages", requireAuth, async (req: any, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.userId;
    const { content, messageType, mediaUrl, replyTo } = req.body;

    if (!content && !mediaUrl) {
      return res.status(400).json({ error: "Content or media required" });
    }

    const [membership] = await db
      .select()
      .from(chatMembersTable)
      .where(
        and(
          eq(chatMembersTable.chatId, Number(chatId)),
          eq(chatMembersTable.userId, userId)
        )
      );

    if (!membership) {
      return res.status(403).json({ error: "Not a member of this chat" });
    }

    // Parse Telegram-style Markdown into entities
    let parsedText = content || "";
    let messageEntities = null;
    if (content && (!messageType || messageType === "text")) {
      const parsed = parseMarkdown(content);
      parsedText = parsed.text;
      messageEntities = parsed.entities.length > 0 ? parsed.entities : null;
    }

    const [message] = await db
      .insert(messagesTable)
      .values({
        chatId: Number(chatId),
        senderId: userId,
        content: parsedText || null,
        entities: messageEntities,
        messageType: messageType || "text",
        mediaUrl: mediaUrl || null,
        replyTo: replyTo || null,
      })
      .returning();

    const [sender] = await db
      .select({ username: usersTable.username, avatarUrl: usersTable.avatarUrl })
      .from(usersTable)
      .where(eq(usersTable.id, userId));

    const io = req.app.get("io");
    if (io) {
      io.to(`chat:${chatId}`).emit("message:new", {
        ...message,
        senderName: sender?.username,
        senderAvatar: sender?.avatarUrl,
        reactions: [],
      });
    }

    res.status(201).json({
      ...message,
      senderName: sender?.username,
      senderAvatar: sender?.avatarUrl,
      reactions: [],
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Edit message
router.put("/messages/:messageId", requireAuth, async (req: any, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.userId;
    const { content } = req.body;

    const [message] = await db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.id, Number(messageId)));

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    if (message.senderId !== userId) {
      return res.status(403).json({ error: "Can only edit own messages" });
    }

    // Re-parse Markdown on edit
    let editedText = content;
    let editedEntities = null;
    if (content) {
      const parsed = parseMarkdown(content);
      editedText = parsed.text;
      editedEntities = parsed.entities.length > 0 ? parsed.entities : null;
    }

    const [updated] = await db
      .update(messagesTable)
      .set({ content: editedText, entities: editedEntities, isEdited: true })
      .where(eq(messagesTable.id, Number(messageId)))
      .returning();

    const io = req.app.get("io");
    if (io) {
      io.to(`chat:${message.chatId}`).emit("message:edited", updated);
    }

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete message (soft delete)
router.delete("/messages/:messageId", requireAuth, async (req: any, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.userId;

    const [message] = await db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.id, Number(messageId)));

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    if (message.senderId !== userId) {
      return res.status(403).json({ error: "Can only delete own messages" });
    }

    await db
      .update(messagesTable)
      .set({ isDeleted: true, deletedAt: new Date() })
      .where(eq(messagesTable.id, Number(messageId)));

    const io = req.app.get("io");
    if (io) {
      io.to(`chat:${message.chatId}`).emit("message:deleted", { id: Number(messageId) });
    }

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Pin / unpin message
router.post("/messages/:messageId/pin", requireAuth, async (req: any, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.userId;
    const { pinned } = req.body;

    const [message] = await db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.id, Number(messageId)));

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    const [membership] = await db
      .select()
      .from(chatMembersTable)
      .where(
        and(
          eq(chatMembersTable.chatId, message.chatId),
          eq(chatMembersTable.userId, userId)
        )
      );

    if (!membership || !["creator", "admin"].includes(membership.role || "")) {
      return res.status(403).json({ error: "Not allowed to pin messages" });
    }

    await db
      .update(chatsTable)
      .set({ pinnedMessageId: pinned ? Number(messageId) : null })
      .where(eq(chatsTable.id, message.chatId));

    res.json({ success: true, pinned });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Add reaction
router.post("/messages/:messageId/reactions", requireAuth, async (req: any, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.userId;
    const { emoji } = req.body;

    if (!emoji) {
      return res.status(400).json({ error: "Emoji required" });
    }

    const [message] = await db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.id, Number(messageId)));

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Check if already reacted with same emoji
    const [existing] = await db
      .select()
      .from(reactionsTable)
      .where(
        and(
          eq(reactionsTable.messageId, Number(messageId)),
          eq(reactionsTable.userId, userId),
          eq(reactionsTable.emoji, emoji)
        )
      );

    if (existing) {
      // Remove reaction (toggle off)
      await db.delete(reactionsTable)
        .where(eq(reactionsTable.id, existing.id));
    } else {
      // Add reaction
      await db.insert(reactionsTable).values({
        messageId: Number(messageId),
        userId,
        emoji,
      });
    }

    const reactions = await db
      .select({
        emoji: reactionsTable.emoji,
        count: sql<number>`COUNT(*)`,
      })
      .from(reactionsTable)
      .where(eq(reactionsTable.messageId, Number(messageId)))
      .groupBy(reactionsTable.emoji);

    const myReactions = await db
      .select({ emoji: reactionsTable.emoji })
      .from(reactionsTable)
      .where(
        and(
          eq(reactionsTable.messageId, Number(messageId)),
          eq(reactionsTable.userId, userId)
        )
      );

    const reactionList = reactions.map((r) => ({
      emoji: r.emoji,
      count: Number(r.count),
      mine: myReactions.some((mr) => mr.emoji === r.emoji),
    }));

    const io = req.app.get("io");
    if (io) {
      io.to(`chat:${message.chatId}`).emit("message:reactions", {
        messageId: Number(messageId),
        reactions: reactionList,
      });
    }

    res.json({ reactions: reactionList });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Forward message
router.post("/messages/:messageId/forward", requireAuth, async (req: any, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.userId;
    const { chatId: targetChatId } = req.body;

    const [message] = await db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.id, Number(messageId)));

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    const [membership] = await db
      .select()
      .from(chatMembersTable)
      .where(
        and(
          eq(chatMembersTable.chatId, Number(targetChatId)),
          eq(chatMembersTable.userId, userId)
        )
      );

    if (!membership) {
      return res.status(403).json({ error: "Not a member of target chat" });
    }

    const [forwarded] = await db
      .insert(messagesTable)
      .values({
        chatId: Number(targetChatId),
        senderId: userId,
        content: message.content,
        entities: message.entities,
        messageType: message.messageType,
        mediaUrl: message.mediaUrl,
      })
      .returning();

    const [sender] = await db
      .select({ username: usersTable.username, avatarUrl: usersTable.avatarUrl })
      .from(usersTable)
      .where(eq(usersTable.id, userId));

    const io = req.app.get("io");
    if (io) {
      io.to(`chat:${targetChatId}`).emit("message:new", {
        ...forwarded,
        senderName: sender?.username,
        senderAvatar: sender?.avatarUrl,
        reactions: [],
      });
    }

    res.status(201).json(forwarded);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Search messages
router.get("/messages/search", requireAuth, async (req: any, res) => {
  try {
    const userId = req.userId;
    const { q, chatId } = req.query;

    if (!q || String(q).length < 2) {
      return res.json([]);
    }

    const conditions = [
      eq(messagesTable.isDeleted, false),
      sql`${messagesTable.content} ILIKE ${"%" + q + "%"}`,
    ];

    if (chatId) {
      conditions.push(eq(messagesTable.chatId, Number(chatId)));
    } else {
      // Only search in chats user is member of
      const userChatIds = await db
        .select({ chatId: chatMembersTable.chatId })
        .from(chatMembersTable)
        .where(eq(chatMembersTable.userId, userId));

      if (userChatIds.length === 0) {
        return res.json([]);
      }

      conditions.push(
        sql`${messagesTable.chatId} IN (${userChatIds.map((c) => c.chatId).join(",")})`
      );
    }

    const messages = await db
      .select({
        id: messagesTable.id,
        chatId: messagesTable.chatId,
        senderId: messagesTable.senderId,
        content: messagesTable.content,
        messageType: messagesTable.messageType,
        createdAt: messagesTable.createdAt,
      })
      .from(messagesTable)
      .where(and(...conditions))
      .orderBy(desc(messagesTable.createdAt))
      .limit(50);

    const results = await Promise.all(
      messages.map(async (msg) => {
        const [sender] = msg.senderId
          ? await db
              .select({ username: usersTable.username })
              .from(usersTable)
              .where(eq(usersTable.id, msg.senderId))
          : [];

        const [chat] = await db
          .select({ name: chatsTable.name })
          .from(chatsTable)
          .where(eq(chatsTable.id, msg.chatId));

        return {
          ...msg,
          senderName: sender?.username || "Unknown",
          chatName: chat?.name || "Unknown",
        };
      })
    );

    res.json(results);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
