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
  reactionsTable,
  chatFoldersTable,
  folderChatsTable,
} from "@workspace/db/schema";
import { eq, and, or, desc, sql, count, ne } from "drizzle-orm";

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
        photo: chatsTable.photo,
        isArchived: chatsTable.isArchived,
        createdAt: chatsTable.createdAt,
        role: chatMembersTable.role,
        pinnedAt: chatMembersTable.pinnedAt,
        archivedAt: chatMembersTable.archivedAt,
      })
      .from(chatMembersTable)
      .innerJoin(chatsTable, eq(chatMembersTable.chatId, chatsTable.id))
      .where(eq(chatMembersTable.userId, userId))
      .orderBy(desc(chatMembersTable.pinnedAt), desc(chatsTable.updatedAt));

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
          .where(
            and(
              eq(messagesTable.chatId, chat.id),
              eq(messagesTable.isDeleted, false)
            )
          )
          .orderBy(desc(messagesTable.createdAt))
          .limit(1);

        const [sender] = lastMessage?.senderId
          ? await db
              .select({ username: usersTable.username, avatarUrl: usersTable.avatarUrl })
              .from(usersTable)
              .where(eq(usersTable.id, lastMessage.senderId))
          : [];

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
              eq(messagesTable.isDeleted, false),
              sql`${messageReadsTable.id} IS NULL`,
              ne(messagesTable.senderId, userId)
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
        isSecret: type === "secret",
        createdBy: userId,
      })
      .returning();

    // Add creator as admin/creator
    await db.insert(chatMembersTable).values({
      chatId: chat.id,
      userId: userId,
      role: "creator",
    });

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

    const members = await db
      .select({
        id: chatMembersTable.id,
        userId: chatMembersTable.userId,
        username: usersTable.username,
        avatarUrl: usersTable.avatarUrl,
        isOnline: usersTable.isOnline,
        lastSeenAt: usersTable.lastSeenAt,
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

// Delete / leave chat
router.delete("/chats/:chatId", requireAuth, async (req: any, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.userId;

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

    if (membership.role === "creator") {
      // Delete entire chat
      await db.delete(chatsTable).where(eq(chatsTable.id, Number(chatId)));
    } else {
      // Just leave
      await db.delete(chatMembersTable)
        .where(
          and(
            eq(chatMembersTable.chatId, Number(chatId)),
            eq(chatMembersTable.userId, userId)
          )
        );
    }

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get chat members
router.get("/chats/:chatId/members", requireAuth, async (req: any, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.userId;

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

    const members = await db
      .select({
        id: chatMembersTable.id,
        userId: chatMembersTable.userId,
        username: usersTable.username,
        avatarUrl: usersTable.avatarUrl,
        isOnline: usersTable.isOnline,
        lastSeenAt: usersTable.lastSeenAt,
        role: chatMembersTable.role,
        joinedAt: chatMembersTable.joinedAt,
      })
      .from(chatMembersTable)
      .innerJoin(usersTable, eq(chatMembersTable.userId, usersTable.id))
      .where(eq(chatMembersTable.chatId, Number(chatId)));

    res.json(members);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Add member
router.post("/chats/:chatId/members", requireAuth, async (req: any, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.userId;
    const { userId: targetUserId } = req.body;

    const [membership] = await db
      .select()
      .from(chatMembersTable)
      .where(
        and(
          eq(chatMembersTable.chatId, Number(chatId)),
          eq(chatMembersTable.userId, userId)
        )
      );

    if (!membership || !["creator", "admin"].includes(membership.role || "")) {
      return res.status(403).json({ error: "Not allowed to add members" });
    }

    const [existing] = await db
      .select()
      .from(chatMembersTable)
      .where(
        and(
          eq(chatMembersTable.chatId, Number(chatId)),
          eq(chatMembersTable.userId, targetUserId)
        )
      );

    if (existing) {
      return res.status(409).json({ error: "User already in chat" });
    }

    await db.insert(chatMembersTable).values({
      chatId: Number(chatId),
      userId: targetUserId,
      role: "member",
    });

    res.status(201).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Remove / kick member
router.delete("/chats/:chatId/members/:targetUserId", requireAuth, async (req: any, res) => {
  try {
    const { chatId, targetUserId } = req.params;
    const userId = req.userId;

    const [membership] = await db
      .select()
      .from(chatMembersTable)
      .where(
        and(
          eq(chatMembersTable.chatId, Number(chatId)),
          eq(chatMembersTable.userId, userId)
        )
      );

    if (!membership || !["creator", "admin"].includes(membership.role || "")) {
      return res.status(403).json({ error: "Not allowed to remove members" });
    }

    const [targetMember] = await db
      .select()
      .from(chatMembersTable)
      .where(
        and(
          eq(chatMembersTable.chatId, Number(chatId)),
          eq(chatMembersTable.userId, Number(targetUserId))
        )
      );

    if (!targetMember) {
      return res.status(404).json({ error: "Member not found" });
    }

    if (targetMember.role === "creator") {
      return res.status(403).json({ error: "Cannot remove creator" });
    }

    await db.delete(chatMembersTable)
      .where(
        and(
          eq(chatMembersTable.chatId, Number(chatId)),
          eq(chatMembersTable.userId, Number(targetUserId))
        )
      );

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Generate invite link
router.post("/chats/:chatId/invite", requireAuth, async (req: any, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.userId;

    const [membership] = await db
      .select()
      .from(chatMembersTable)
      .where(
        and(
          eq(chatMembersTable.chatId, Number(chatId)),
          eq(chatMembersTable.userId, userId)
        )
      );

    if (!membership || !["creator", "admin"].includes(membership.role || "")) {
      return res.status(403).json({ error: "Not allowed" });
    }

    const inviteLink = crypto.randomUUID();

    await db.update(chatsTable)
      .set({ inviteLink })
      .where(eq(chatsTable.id, Number(chatId)));

    res.json({ inviteLink });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Join by invite link
router.post("/chats/join/:inviteLink", requireAuth, async (req: any, res) => {
  try {
    const { inviteLink } = req.params;
    const userId = req.userId;

    const [chat] = await db
      .select()
      .from(chatsTable)
      .where(eq(chatsTable.inviteLink, inviteLink));

    if (!chat) {
      return res.status(404).json({ error: "Invalid invite link" });
    }

    const [existing] = await db
      .select()
      .from(chatMembersTable)
      .where(
        and(
          eq(chatMembersTable.chatId, chat.id),
          eq(chatMembersTable.userId, userId)
        )
      );

    if (existing) {
      return res.json(chat);
    }

    await db.insert(chatMembersTable).values({
      chatId: chat.id,
      userId,
      role: "member",
    });

    res.json(chat);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Pin chat
router.post("/chats/:chatId/pin", requireAuth, async (req: any, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.userId;

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

    await db
      .update(chatMembersTable)
      .set({ pinnedAt: new Date() })
      .where(
        and(
          eq(chatMembersTable.chatId, Number(chatId)),
          eq(chatMembersTable.userId, userId)
        )
      );

    res.json({ success: true, pinned: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Archive chat
router.post("/chats/:chatId/archive", requireAuth, async (req: any, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.userId;

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

    await db
      .update(chatMembersTable)
      .set({ archivedAt: new Date() })
      .where(
        and(
          eq(chatMembersTable.chatId, Number(chatId)),
          eq(chatMembersTable.userId, userId)
        )
      );

    res.json({ success: true, archived: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Unarchive chat
router.post("/chats/:chatId/unarchive", requireAuth, async (req: any, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.userId;

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

    await db
      .update(chatMembersTable)
      .set({ archivedAt: null })
      .where(
        and(
          eq(chatMembersTable.chatId, Number(chatId)),
          eq(chatMembersTable.userId, userId)
        )
      );

    res.json({ success: true, archived: false });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Unpin chat
router.post("/chats/:chatId/unpin", requireAuth, async (req: any, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.userId;

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

    await db
      .update(chatMembersTable)
      .set({ pinnedAt: null })
      .where(
        and(
          eq(chatMembersTable.chatId, Number(chatId)),
          eq(chatMembersTable.userId, userId)
        )
      );

    res.json({ success: true, pinned: false });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update chat photo
router.put("/chats/:chatId/photo", requireAuth, async (req: any, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.userId;
    const { photo } = req.body;

    const [membership] = await db
      .select()
      .from(chatMembersTable)
      .where(
        and(
          eq(chatMembersTable.chatId, Number(chatId)),
          eq(chatMembersTable.userId, userId)
        )
      );

    if (!membership || !["creator", "admin"].includes(membership.role || "")) {
      return res.status(403).json({ error: "Not allowed to change chat photo" });
    }

    const [updated] = await db
      .update(chatsTable)
      .set({ photo })
      .where(eq(chatsTable.id, Number(chatId)))
      .returning();

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update auto-delete timer
router.put("/chats/:chatId/auto-delete", requireAuth, async (req: any, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.userId;
    const { timer } = req.body; // seconds or null to disable

    const [membership] = await db
      .select()
      .from(chatMembersTable)
      .where(
        and(
          eq(chatMembersTable.chatId, Number(chatId)),
          eq(chatMembersTable.userId, userId)
        )
      );

    if (!membership || !["creator", "admin"].includes(membership.role || "")) {
      return res.status(403).json({ error: "Not allowed to change auto-delete timer" });
    }

    const [updated] = await db
      .update(chatsTable)
      .set({ autoDeleteTimer: timer })
      .where(eq(chatsTable.id, Number(chatId)))
      .returning();

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update member role
router.put("/chats/:chatId/members/:targetUserId/role", requireAuth, async (req: any, res) => {
  try {
    const { chatId, targetUserId } = req.params;
    const userId = req.userId;
    const { role } = req.body;

    const [membership] = await db
      .select()
      .from(chatMembersTable)
      .where(
        and(
          eq(chatMembersTable.chatId, Number(chatId)),
          eq(chatMembersTable.userId, userId)
        )
      );

    if (membership?.role !== "creator") {
      return res.status(403).json({ error: "Only creator can change roles" });
    }

    await db.update(chatMembersTable)
      .set({ role })
      .where(
        and(
          eq(chatMembersTable.chatId, Number(chatId)),
          eq(chatMembersTable.userId, Number(targetUserId))
        )
      );

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's custom folders
router.get("/folders", requireAuth, async (req: any, res) => {
  try {
    const userId = req.userId;

    const folders = await db
      .select()
      .from(chatFoldersTable)
      .where(eq(chatFoldersTable.userId, userId))
      .orderBy(chatFoldersTable.sortOrder);

    // Include chat counts
    const foldersWithCounts = await Promise.all(
      folders.map(async (folder) => {
        const count = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(folderChatsTable)
          .where(eq(folderChatsTable.folderId, folder.id));

        return {
          ...folder,
          chatCount: count[0]?.count || 0,
        };
      })
    );

    res.json(foldersWithCounts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create folder
router.post("/folders", requireAuth, async (req: any, res) => {
  try {
    const userId = req.userId;
    const { name, icon, color, includeTypes, excludeMuted } = req.body;

    const [folder] = await db
      .insert(chatFoldersTable)
      .values({
        userId,
        name,
        icon: icon || null,
        color: color || null,
        includeTypes: includeTypes || "",
        excludeMuted: excludeMuted || false,
      })
      .returning();

    res.status(201).json(folder);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update folder
router.put("/folders/:folderId", requireAuth, async (req: any, res) => {
  try {
    const { folderId } = req.params;
    const userId = req.userId;
    const { name, icon, color, includeTypes, excludeMuted, sortOrder } = req.body;

    const [folder] = await db
      .select()
      .from(chatFoldersTable)
      .where(
        and(
          eq(chatFoldersTable.id, Number(folderId)),
          eq(chatFoldersTable.userId, userId)
        )
      );

    if (!folder) {
      return res.status(403).json({ error: "Not allowed" });
    }

    const [updated] = await db
      .update(chatFoldersTable)
      .set({
        name: name || folder.name,
        icon: icon !== undefined ? icon : folder.icon,
        color: color !== undefined ? color : folder.color,
        includeTypes: includeTypes !== undefined ? includeTypes : folder.includeTypes,
        excludeMuted: excludeMuted !== undefined ? excludeMuted : folder.excludeMuted,
        sortOrder: sortOrder !== undefined ? sortOrder : folder.sortOrder,
      })
      .where(eq(chatFoldersTable.id, Number(folderId)))
      .returning();

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete folder
router.delete("/folders/:folderId", requireAuth, async (req: any, res) => {
  try {
    const { folderId } = req.params;
    const userId = req.userId;

    const [folder] = await db
      .select()
      .from(chatFoldersTable)
      .where(
        and(
          eq(chatFoldersTable.id, Number(folderId)),
          eq(chatFoldersTable.userId, userId)
        )
      );

    if (!folder) {
      return res.status(403).json({ error: "Not allowed" });
    }

    await db.delete(chatFoldersTable).where(eq(chatFoldersTable.id, Number(folderId)));

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Add chat to folder
router.post("/folders/:folderId/chats/:chatId", requireAuth, async (req: any, res) => {
  try {
    const { folderId, chatId } = req.params;
    const userId = req.userId;

    const [folder] = await db
      .select()
      .from(chatFoldersTable)
      .where(
        and(
          eq(chatFoldersTable.id, Number(folderId)),
          eq(chatFoldersTable.userId, userId)
        )
      );

    if (!folder) {
      return res.status(403).json({ error: "Not allowed" });
    }

    await db
      .insert(folderChatsTable)
      .values({ folderId: Number(folderId), chatId: Number(chatId) })
      .onConflictDoNothing();

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Remove chat from folder
router.delete("/folders/:folderId/chats/:chatId", requireAuth, async (req: any, res) => {
  try {
    const { folderId, chatId } = req.params;
    const userId = req.userId;

    const [folder] = await db
      .select()
      .from(chatFoldersTable)
      .where(
        and(
          eq(chatFoldersTable.id, Number(folderId)),
          eq(chatFoldersTable.userId, userId)
        )
      );

    if (!folder) {
      return res.status(403).json({ error: "Not allowed" });
    }

    await db
      .delete(folderChatsTable)
      .where(
        and(
          eq(folderChatsTable.folderId, Number(folderId)),
          eq(folderChatsTable.chatId, Number(chatId))
        )
      );

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
