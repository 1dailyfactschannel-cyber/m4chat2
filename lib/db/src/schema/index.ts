import {
  pgTable,
  text,
  serial,
  timestamp,
  integer,
  boolean,
  varchar,
  primaryKey,
  index,
  jsonb,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// ==========================================
// Типы для entities в сообщениях
// ==========================================
export type MessageEntityType =
  | "bold"
  | "italic"
  | "code"
  | "pre"
  | "spoiler"
  | "strikethrough"
  | "text_link"
  | "mention"
  | "hashtag"
  | "bot_command";

export interface MessageEntity {
  offset: number;
  length: number;
  type: MessageEntityType;
  url?: string; // for text_link
  language?: string; // for pre
}

// ==========================================
// 1. Таблица пользователей
// ==========================================
export const usersTable = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    username: varchar("username", { length: 100 }).notNull().unique(),
    email: varchar("email", { length: 255 }).unique(),
    phone: varchar("phone", { length: 50 }).unique(),
    passwordHash: varchar("password_hash", { length: 255 }),
    avatarUrl: varchar("avatar_url", { length: 500 }),
    bio: text("bio"),
    isOnline: boolean("is_online").default(false),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }),
    twoFASecret: varchar("two_fa_secret", { length: 255 }),
    twoFAEnabled: boolean("two_fa_enabled").default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    usernameIdx: index("users_username_idx").on(table.username),
    phoneIdx: index("users_phone_idx").on(table.phone),
  }),
);

export const insertUserSchema = createInsertSchema(usersTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const selectUserSchema = createSelectSchema(usersTable);
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = z.infer<typeof selectUserSchema>;

// ==========================================
// 2. Таблица чатов
// ==========================================
export const chatsTable = pgTable(
  "chats",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }),
    type: varchar("type", { length: 50 }).default("private"), // private, group, channel
    photo: varchar("photo", { length: 500 }),
    inviteLink: varchar("invite_link", { length: 255 }).unique(),
    pinnedMessageId: integer("pinned_message_id"),
    isArchived: boolean("is_archived").default(false),
    createdBy: integer("created_by").references(() => usersTable.id),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    typeIdx: index("chats_type_idx").on(table.type),
    inviteLinkIdx: index("chats_invite_link_idx").on(table.inviteLink),
  }),
);

export const insertChatSchema = createInsertSchema(chatsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const selectChatSchema = createSelectSchema(chatsTable);
export type InsertChat = z.infer<typeof insertChatSchema>;
export type Chat = z.infer<typeof selectChatSchema>;

// ==========================================
// 3. Таблица участников чатов
// ==========================================
export const chatMembersTable = pgTable(
  "chat_members",
  {
    id: serial("id").primaryKey(),
    chatId: integer("chat_id")
      .references(() => chatsTable.id, { onDelete: "cascade" })
      .notNull(),
    userId: integer("user_id")
      .references(() => usersTable.id, { onDelete: "cascade" })
      .notNull(),
    role: varchar("role", { length: 50 }).default("member"), // creator, admin, member, restricted
    joinedAt: timestamp("joined_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.chatId, table.userId] }),
    chatIdIdx: index("chat_members_chat_id_idx").on(table.chatId),
    userIdIdx: index("chat_members_user_id_idx").on(table.userId),
  }),
);

export const insertChatMemberSchema = createInsertSchema(chatMembersTable).omit(
  { id: true, joinedAt: true },
);
export const selectChatMemberSchema = createSelectSchema(chatMembersTable);
export type InsertChatMember = z.infer<typeof insertChatMemberSchema>;
export type ChatMember = z.infer<typeof selectChatMemberSchema>;

// ==========================================
// 4. Таблица сообщений
// ==========================================
export const messagesTable = pgTable(
  "messages",
  {
    id: serial("id").primaryKey(),
    chatId: integer("chat_id")
      .references(() => chatsTable.id, { onDelete: "cascade" })
      .notNull(),
    senderId: integer("sender_id").references(() => usersTable.id, {
      onDelete: "set null",
    }),
    content: text("content"),
    messageType: varchar("message_type", { length: 50 }).default("text"), // text, image, file, voice, video, poll
    mediaUrl: varchar("media_url", { length: 500 }),
    entities: jsonb("entities").$type<MessageEntity[]>(),
  replyTo: integer("reply_to").references((): AnyPgColumn => messagesTable.id, {
    onDelete: "set null",
  }),
    isEdited: boolean("is_edited").default(false),
    isDeleted: boolean("is_deleted").default(false),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    chatIdIdx: index("messages_chat_id_idx").on(table.chatId),
    senderIdIdx: index("messages_sender_id_idx").on(table.senderId),
    createdAtIdx: index("messages_created_at_idx").on(table.createdAt),
  }),
);

export const insertMessageSchema = createInsertSchema(messagesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const selectMessageSchema = createSelectSchema(messagesTable);
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = z.infer<typeof selectMessageSchema>;

// ==========================================
// 5. Таблица статуса прочтения
// ==========================================
export const messageReadsTable = pgTable(
  "message_reads",
  {
    id: serial("id").primaryKey(),
    messageId: integer("message_id")
      .references(() => messagesTable.id, { onDelete: "cascade" })
      .notNull(),
    userId: integer("user_id")
      .references(() => usersTable.id, { onDelete: "cascade" })
      .notNull(),
    readAt: timestamp("read_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.messageId, table.userId] }),
  }),
);

export const insertMessageReadSchema = createInsertSchema(
  messageReadsTable,
).omit({ id: true, readAt: true });
export const selectMessageReadSchema = createSelectSchema(messageReadsTable);
export type InsertMessageRead = z.infer<typeof insertMessageReadSchema>;
export type MessageRead = z.infer<typeof selectMessageReadSchema>;

// ==========================================
// 6. Таблица сессий
// ==========================================
export const sessionsTable = pgTable(
  "sessions",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .references(() => usersTable.id, { onDelete: "cascade" })
      .notNull(),
    token: varchar("token", { length: 255 }).notNull().unique(),
    refreshToken: varchar("refresh_token", { length: 255 }).unique(),
    deviceInfo: text("device_info"),
    ipAddress: varchar("ip_address", { length: 45 }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    tokenIdx: index("sessions_token_idx").on(table.token),
    refreshTokenIdx: index("sessions_refresh_token_idx").on(table.refreshToken),
    userIdIdx: index("sessions_user_id_idx").on(table.userId),
  }),
);

export const insertSessionSchema = createInsertSchema(sessionsTable).omit({
  id: true,
  createdAt: true,
});
export const selectSessionSchema = createSelectSchema(sessionsTable);
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = z.infer<typeof selectSessionSchema>;

// ==========================================
// 7. Таблица реакций на сообщения
// ==========================================
export const reactionsTable = pgTable(
  "reactions",
  {
    id: serial("id").primaryKey(),
    messageId: integer("message_id")
      .references(() => messagesTable.id, { onDelete: "cascade" })
      .notNull(),
    userId: integer("user_id")
      .references(() => usersTable.id, { onDelete: "cascade" })
      .notNull(),
    emoji: varchar("emoji", { length: 50 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.messageId, table.userId, table.emoji] }),
    messageIdIdx: index("reactions_message_id_idx").on(table.messageId),
  }),
);

export const insertReactionSchema = createInsertSchema(reactionsTable).omit({
  id: true,
  createdAt: true,
});
export const selectReactionSchema = createSelectSchema(reactionsTable);
export type InsertReaction = z.infer<typeof insertReactionSchema>;
export type Reaction = z.infer<typeof selectReactionSchema>;

// ==========================================
// 8. Таблица файлов (медиа, документы)
// ==========================================
export const filesTable = pgTable(
  "files",
  {
    id: serial("id").primaryKey(),
    chatId: integer("chat_id").references(() => chatsTable.id, {
      onDelete: "cascade",
    }),
    messageId: integer("message_id").references(() => messagesTable.id, {
      onDelete: "cascade",
    }),
    uploaderId: integer("uploader_id").references(() => usersTable.id, {
      onDelete: "set null",
    }),
    fileKey: varchar("file_key", { length: 500 }).notNull(),
    fileName: varchar("file_name", { length: 255 }),
    mimeType: varchar("mime_type", { length: 100 }),
    size: integer("size"),
    url: varchar("url", { length: 1000 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    chatIdIdx: index("files_chat_id_idx").on(table.chatId),
    messageIdIdx: index("files_message_id_idx").on(table.messageId),
  }),
);

export const insertFileSchema = createInsertSchema(filesTable).omit({
  id: true,
  createdAt: true,
});
export const selectFileSchema = createSelectSchema(filesTable);
export type InsertFile = z.infer<typeof insertFileSchema>;
export type FileItem = z.infer<typeof selectFileSchema>;

// ==========================================
// 9. Таблица папок чатов (Chat Folders)
// ==========================================
export const chatFoldersTable = pgTable(
  "chat_folders",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .references(() => usersTable.id, { onDelete: "cascade" })
      .notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    icon: varchar("icon", { length: 50 }),
    color: varchar("color", { length: 50 }),
    includeTypes: text("include_types").default(""), // comma-separated: private,group,channel
    excludeMuted: boolean("exclude_muted").default(false),
    sortOrder: integer("sort_order").default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    userIdIdx: index("chat_folders_user_id_idx").on(table.userId),
  }),
);

export const insertChatFolderSchema = createInsertSchema(chatFoldersTable).omit({
  id: true,
  createdAt: true,
});
export const selectChatFolderSchema = createSelectSchema(chatFoldersTable);
export type InsertChatFolder = z.infer<typeof insertChatFolderSchema>;
export type ChatFolder = z.infer<typeof selectChatFolderSchema>;

// ==========================================
// 10. Таблица связи чатов с папками
// ==========================================
export const folderChatsTable = pgTable(
  "folder_chats",
  {
    folderId: integer("folder_id")
      .references(() => chatFoldersTable.id, { onDelete: "cascade" })
      .notNull(),
    chatId: integer("chat_id")
      .references(() => chatsTable.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.folderId, table.chatId] }),
  }),
);

export const insertFolderChatSchema = createInsertSchema(folderChatsTable);
export const selectFolderChatSchema = createSelectSchema(folderChatsTable);
export type InsertFolderChat = z.infer<typeof insertFolderChatSchema>;
export type FolderChat = z.infer<typeof selectFolderChatSchema>;

// ==========================================
// 11. Signal Protocol — Identity Keys
// ==========================================
export const signalIdentityTable = pgTable(
  "signal_identity",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .references(() => usersTable.id, { onDelete: "cascade" })
      .notNull()
      .unique(),
    registrationId: integer("registration_id").notNull(),
    publicKey: text("public_key").notNull(), // base64 X25519 public key
    privateKey: text("private_key").notNull(), // base64 X25519 private key (encrypted at rest in real prod)
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    userIdIdx: index("signal_identity_user_id_idx").on(table.userId),
  }),
);

export const insertSignalIdentitySchema = createInsertSchema(signalIdentityTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const selectSignalIdentitySchema = createSelectSchema(signalIdentityTable);
export type InsertSignalIdentity = z.infer<typeof insertSignalIdentitySchema>;
export type SignalIdentity = z.infer<typeof selectSignalIdentitySchema>;

// ==========================================
// 12. Signal Protocol — Signed Pre-Keys
// ==========================================
export const signalSignedPreKeyTable = pgTable(
  "signal_signed_prekey",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .references(() => usersTable.id, { onDelete: "cascade" })
      .notNull(),
    keyId: integer("key_id").notNull(),
    publicKey: text("public_key").notNull(),
    privateKey: text("private_key").notNull(),
    signature: text("signature").notNull(), // base64 signature of publicKey by identity key
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    userIdIdx: index("signal_signed_prekey_user_id_idx").on(table.userId),
    userKeyId: index("signal_signed_prekey_user_key_id_idx").on(table.userId, table.keyId),
  }),
);

export const insertSignalSignedPreKeySchema = createInsertSchema(signalSignedPreKeyTable).omit({
  id: true,
  createdAt: true,
});
export const selectSignalSignedPreKeySchema = createSelectSchema(signalSignedPreKeyTable);
export type InsertSignalSignedPreKey = z.infer<typeof insertSignalSignedPreKeySchema>;
export type SignalSignedPreKey = z.infer<typeof selectSignalSignedPreKeySchema>;

// ==========================================
// 13. Signal Protocol — One-Time Pre-Keys
// ==========================================
export const signalPreKeyTable = pgTable(
  "signal_prekey",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .references(() => usersTable.id, { onDelete: "cascade" })
      .notNull(),
    keyId: integer("key_id").notNull(),
    publicKey: text("public_key").notNull(),
    privateKey: text("private_key").notNull(),
    used: boolean("used").default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    userIdIdx: index("signal_prekey_user_id_idx").on(table.userId),
    userKeyId: index("signal_prekey_user_key_id_idx").on(table.userId, table.keyId),
  }),
);

export const insertSignalPreKeySchema = createInsertSchema(signalPreKeyTable).omit({
  id: true,
  createdAt: true,
});
export const selectSignalPreKeySchema = createSelectSchema(signalPreKeyTable);
export type InsertSignalPreKey = z.infer<typeof insertSignalPreKeySchema>;
export type SignalPreKey = z.infer<typeof selectSignalPreKeySchema>;

// ==========================================
// 14. Signal Protocol — Sessions (Double Ratchet state)
// ==========================================
export const signalSessionTable = pgTable(
  "signal_session",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .references(() => usersTable.id, { onDelete: "cascade" })
      .notNull(),
    chatId: integer("chat_id")
      .references(() => chatsTable.id, { onDelete: "cascade" })
      .notNull(),
    remoteUserId: integer("remote_user_id")
      .references(() => usersTable.id, { onDelete: "cascade" })
      .notNull(),
    remoteRegistrationId: integer("remote_registration_id").notNull(),
    remoteIdentityPublic: text("remote_identity_public").notNull(),
    rootKey: text("root_key").notNull(),
    sendingChainKey: text("sending_chain_key"),
    receivingChainKey: text("receiving_chain_key"),
    sendingMessageNumber: integer("sending_message_number").default(0),
    receivingMessageNumber: integer("receiving_message_number").default(0),
    skippedMessageKeys: text("skipped_message_keys").default("{}"), // JSON map
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    userChatIdx: index("signal_session_user_chat_idx").on(table.userId, table.chatId),
  }),
);

export const insertSignalSessionSchema = createInsertSchema(signalSessionTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const selectSignalSessionSchema = createSelectSchema(signalSessionTable);
export type InsertSignalSession = z.infer<typeof insertSignalSessionSchema>;
export type SignalSession = z.infer<typeof selectSignalSessionSchema>;
