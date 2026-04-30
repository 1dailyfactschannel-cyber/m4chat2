-- ==========================================
-- M4Chat Schema Updates — apply on startup
-- ==========================================
-- Этот файл содержит все ALTER TABLE и CREATE TABLE,
-- которые нужны для работы Stage 1-6.
-- Код применения игнорирует ошибки "already exists".

-- Stage 1.1: entities
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "entities" jsonb;

-- Stage 1.2: pinned chats
ALTER TABLE "chat_members" ADD COLUMN IF NOT EXISTS "pinned_at" timestamp with time zone;
CREATE INDEX IF NOT EXISTS "chat_members_pinned_at_idx" ON "chat_members" ("pinned_at");

-- Stage 1.3: archived chats
ALTER TABLE "chat_members" ADD COLUMN IF NOT EXISTS "archived_at" timestamp with time zone;
CREATE INDEX IF NOT EXISTS "chat_members_archived_at_idx" ON "chat_members" ("archived_at");

-- Stage 1.4: saved messages
ALTER TABLE "chats" ADD COLUMN IF NOT EXISTS "is_self_chat" boolean DEFAULT false;
CREATE INDEX IF NOT EXISTS "chats_is_self_chat_idx" ON "chats" ("is_self_chat");

-- Stage 2.2: silent messages
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "is_silent" boolean DEFAULT false;

-- Stage 2.3: auto-delete timer
ALTER TABLE "chats" ADD COLUMN IF NOT EXISTS "auto_delete_timer" integer;

-- Stage 3: secret chats
ALTER TABLE "chats" ADD COLUMN IF NOT EXISTS "is_secret" boolean DEFAULT false;
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "encrypted_payload" text;

-- Stage 5.2: polls
CREATE TABLE IF NOT EXISTS "polls" (
  "id" serial PRIMARY KEY,
  "message_id" integer NOT NULL REFERENCES "messages"("id") ON DELETE CASCADE,
  "question" text NOT NULL,
  "options" jsonb,
  "is_anonymous" boolean DEFAULT true,
  "allows_multiple" boolean DEFAULT false,
  "created_at" timestamp with time zone DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "polls_message_id_idx" ON "polls" ("message_id");

CREATE TABLE IF NOT EXISTS "poll_votes" (
  "id" serial PRIMARY KEY,
  "poll_id" integer NOT NULL REFERENCES "polls"("id") ON DELETE CASCADE,
  "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "option_index" integer NOT NULL,
  "created_at" timestamp with time zone DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "poll_votes_poll_user_idx" ON "poll_votes" ("poll_id", "user_id");

-- Stage 6.2: stickers
CREATE TABLE IF NOT EXISTS "sticker_packs" (
  "id" serial PRIMARY KEY,
  "name" varchar(255) NOT NULL,
  "thumbnail" varchar(500),
  "created_by" integer REFERENCES "users"("id") ON DELETE CASCADE,
  "created_at" timestamp with time zone DEFAULT NOW(),
  "updated_at" timestamp with time zone DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "sticker_packs_created_by_idx" ON "sticker_packs" ("created_by");

CREATE TABLE IF NOT EXISTS "stickers" (
  "id" serial PRIMARY KEY,
  "pack_id" integer NOT NULL REFERENCES "sticker_packs"("id") ON DELETE CASCADE,
  "emoji" varchar(50) NOT NULL,
  "image_url" varchar(1000) NOT NULL,
  "created_at" timestamp with time zone DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "stickers_pack_id_idx" ON "stickers" ("pack_id");

-- Stage 6.5: bots
CREATE TABLE IF NOT EXISTS "bots" (
  "id" serial PRIMARY KEY,
  "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "username" varchar(100) NOT NULL UNIQUE,
  "name" varchar(255) NOT NULL,
  "token" varchar(255) NOT NULL UNIQUE,
  "description" text,
  "avatar_url" varchar(500),
  "webhook_url" varchar(1000),
  "is_active" boolean DEFAULT true,
  "created_at" timestamp with time zone DEFAULT NOW(),
  "updated_at" timestamp with time zone DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "bots_user_id_idx" ON "bots" ("user_id");
CREATE INDEX IF NOT EXISTS "bots_token_idx" ON "bots" ("token");

CREATE TABLE IF NOT EXISTS "bot_commands" (
  "id" serial PRIMARY KEY,
  "bot_id" integer NOT NULL REFERENCES "bots"("id") ON DELETE CASCADE,
  "command" varchar(100) NOT NULL,
  "description" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "bot_commands_bot_id_idx" ON "bot_commands" ("bot_id");
