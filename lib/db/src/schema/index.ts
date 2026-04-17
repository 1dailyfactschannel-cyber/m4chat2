import {
  pgTable,
  text,
  serial,
  timestamp,
  integer,
  boolean,
  varchar,
  primaryKey,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// ==========================================
// 1. Таблица пользователей
// ==========================================
export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  email: varchar("email", { length: 255 }).unique(),
  passwordHash: varchar("password_hash", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

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
export const chatsTable = pgTable("chats", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }),
  type: varchar("type", { length: 50 }).default("private"), // private, group, channel
  createdBy: integer("created_by").references(() => usersTable.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

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
    role: varchar("role", { length: 50 }).default("member"), // admin, member
    joinedAt: timestamp("joined_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    // Уникальный индекс на пару chat_id + user_id
    pk: primaryKey({ columns: [table.chatId, table.userId] }),
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
export const messagesTable = pgTable("messages", {
  id: serial("id").primaryKey(),
  chatId: integer("chat_id")
    .references(() => chatsTable.id, { onDelete: "cascade" })
    .notNull(),
  senderId: integer("sender_id").references(() => usersTable.id, {
    onDelete: "set null",
  }),
  content: text("content"),
  messageType: varchar("message_type", { length: 50 }).default("text"), // text, image, file, voice
  mediaUrl: varchar("media_url", { length: 500 }),
  replyTo: integer("reply_to").references(() => messagesTable.id, {
    onDelete: "set null",
  }),
  isEdited: boolean("is_edited").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

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
export const sessionsTable = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => usersTable.id, { onDelete: "cascade" })
    .notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const insertSessionSchema = createInsertSchema(sessionsTable).omit({
  id: true,
  createdAt: true,
});
export const selectSessionSchema = createSelectSchema(sessionsTable);
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = z.infer<typeof selectSessionSchema>;
