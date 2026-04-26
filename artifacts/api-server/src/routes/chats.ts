import { Router, type IRouter } from "express";
import crypto from "crypto";
import { db } from "@workspace/db";
import {
  usersTable,
  chatsTable,
  chatMembersTable,
  messagesTable,
  messageReadsTable,
  sessionsTable,
} from "@workspace/db/schema";
import { eq, and, or, desc, sql, count } from "drizzle-orm";

const router: IRouter = Router();

// Middleware: auth check
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

// Get all chats for current user
router.get("/chats", requireAuth, async (req: any, res) => {
  try {
    const userId = req.userId;

    const userChats = await db
      .select({
        id: chatsTable.id,
        name: chatsTable.name,
        type: chatsTable.type,
        createdAt: chatsTable.createdAt,
        role: chatMembersTable.role,
      })
      .from(chatMembersTable)
      .innerJoin(chatsTable, eq(chatMembersTable.chatId, chatsTable.id))
      .where(eq(chatMembersTable.userId, userId));

    // Get last message for each chat
    const chatsWithLastMessage = await Promise.all(
      userChats.map(async (chat) => {
        const [lastMessage] = await db
          .select({
            id: messagesTable.id,
            content: messagesTable.content,
            messageType: messagesTable.messageType,
            senderId: messagesTable.senderId,
            createdAt: messagesTable.createdAt,
          })
          .from(messagesTable)
          .where(eq(messagesTable.chatId, chat.id))
          .orderBy(desc(messagesTable.createdAt))
          .limit(1);

        const [sender] = lastMessage?.senderId
          ? await db
              .select({ username: usersTable.username })
              .from(usersTable)
              .where(eq(usersTable.id, lastMessage.senderId))
          : [];

        // Count unread messages
        const [unread] = await db
          .select({ count: count() })
          .from(messagesTable)
          .leftJoin(
            messageReadsTable,
            and(
              eq(messageReadsTable.messageId, messagesTable.id),
              eq(messageReadsTable.userId, userId)
            )
          )
          .where(
            and(
              eq(messagesTable.chatId, chat.id),
              sql`${messageReadsTable.id} IS NULL`
            )
          );

        return {
          ...chat,
          lastMessage: lastMessage
            ? {
                ...lastMessage,
                senderName: sender?.username || "Unknown",
              }
            : null,
          unreadCount: unread?.count || 0,
        };
      })
    );

    res.json(chatsWithLastMessage);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create new chat (private or group)
router.post("/chats", requireAuth, async (req: any, res) => {
  try {
    const userId = req.userId;
    const { name, type, participantIds } = req.body;

    if (type === "private" && participantIds?.length === 1) {
      // Check if private chat already exists
      const existingChat = await db
        .select({ id: chatsTable.id })
        .from(chatMembersTable)
        .innerJoin(chatsTable, eq(chatMembersTable.chatId, chatsTable.id))
        .where(
          and(
            eq(chatsTable.type, "private"),
            eq(chatMembersTable.userId, userId)
          )
        );

      for (const chat of existingChat) {
        const otherMember = await db
          .select()
          .from(chatMembersTable)
          .where(
            and(
              eq(chatMembersTable.chatId, chat.id),
              eq(chatMembersTable.userId, participantIds[0])
            )
          );
        if (otherMember.length > 0) {
          return res.json({ id: chat.id, type: "private" });
        }
      }
    }

    const [chat] = await db
      .insert(chatsTable)
      .values({
        name: name || null,
        type: type || "private",
        createdBy: userId,
      })
      .returning();

    // Add creator as admin
    await db.insert(chatMembersTable).values({
      chatId: chat.id,
      userId: userId,
      role: "admin",
    });

    // Add participants
    if (participantIds && Array.isArray(participantIds)) {
      for (const pid of participantIds) {
        if (pid !== userId) {
          await db.insert(chatMembersTable).values({
            chatId: chat.id,
            userId: pid,
            role: "member",
          });
        }
      }
    }

    res.status(201).json(chat);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get chat by ID
router.get("/chats/:chatId", requireAuth, async (req: any, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.userId;

    // Verify membership
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

    const [chat] = await db
      .select()
      .from(chatsTable)
      .where(eq(chatsTable.id, Number(chatId)));

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    // Get members
    const members = await db
      .select({
        id: chatMembersTable.id,
        userId: chatMembersTable.userId,
        username: usersTable.username,
        avatarUrl: usersTable.avatarUrl,
        role: chatMembersTable.role,
        joinedAt: chatMembersTable.joinedAt,
      })
      .from(chatMembersTable)
      .innerJoin(usersTable, eq(chatMembersTable.userId, usersTable.id))
      .where(eq(chatMembersTable.chatId, chat.id));

    res.json({ ...chat, members });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get messages for a chat
router.get("/chats/:chatId/messages", requireAuth, async (req: any, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.userId;
    const limit = Number(req.query.limit) || 50;
    const offset = Number(req.query.offset) || 0;

    // Verify membership
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
        messageType: messagesTable.messageType,
        mediaUrl: messagesTable.mediaUrl,
        replyTo: messagesTable.replyTo,
        isEdited: messagesTable.isEdited,
        createdAt: messagesTable.createdAt,
        senderName: usersTable.username,
        senderAvatar: usersTable.avatarUrl,
      })
      .from(messagesTable)
      .leftJoin(usersTable, eq(messagesTable.senderId, usersTable.id))
      .where(eq(messagesTable.chatId, Number(chatId)))
      .orderBy(desc(messagesTable.createdAt))
      .limit(limit)
      .offset(offset);

    // Mark messages as read
    for (const msg of messages) {
      if (msg.senderId !== userId) {
        await db
          .insert(messageReadsTable)
          .values({ messageId: msg.id, userId })
          .onConflictDoNothing();
      }
    }

    res.json(messages.reverse());
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

    // Verify membership
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

    const [message] = await db
      .insert(messagesTable)
      .values({
        chatId: Number(chatId),
        senderId: userId,
        content: content || null,
        messageType: messageType || "text",
        mediaUrl: mediaUrl || null,
        replyTo: replyTo || null,
      })
      .returning();

    const [sender] = await db
      .select({ username: usersTable.username, avatarUrl: usersTable.avatarUrl })
      .from(usersTable)
      .where(eq(usersTable.id, userId));

    res.status(201).json({
      ...message,
      senderName: sender?.username,
      senderAvatar: sender?.avatarUrl,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Search users (for adding to chats)
router.get("/users/search", requireAuth, async (req: any, res) => {
  try {
    const { q } = req.query;
    if (!q || String(q).length < 2) {
      return res.json([]);
    }

    const users = await db
      .select({ id: usersTable.id, username: usersTable.username, avatarUrl: usersTable.avatarUrl })
      .from(usersTable)
      .where(sql`${usersTable.username} ILIKE ${"%" + q + "%"}`)
      .limit(20);

    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
