export const MIGRATIONS_SQL = `
CREATE TABLE IF NOT EXISTS "users" (
  "id" serial PRIMARY KEY,
  "username" varchar(100) NOT NULL UNIQUE,
  "email" varchar(255) UNIQUE,
  "phone" varchar(50) UNIQUE,
  "password_hash" varchar(255),
  "avatar_url" varchar(500),
  "bio" text,
  "is_online" boolean DEFAULT false,
  "last_seen_at" timestamp with time zone,
  "two_fa_secret" varchar(255),
  "two_fa_enabled" boolean DEFAULT false,
  "created_at" timestamp with time zone DEFAULT NOW(),
  "updated_at" timestamp with time zone DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "users_username_idx" ON "users" ("username");
CREATE INDEX IF NOT EXISTS "users_phone_idx" ON "users" ("phone");

CREATE TABLE IF NOT EXISTS "chats" (
  "id" serial PRIMARY KEY,
  "name" varchar(255),
  "type" varchar(50) DEFAULT 'private',
  "photo" varchar(500),
  "invite_link" varchar(255) UNIQUE,
  "pinned_message_id" integer,
  "is_archived" boolean DEFAULT false,
  "is_self_chat" boolean DEFAULT false,
  "is_secret" boolean DEFAULT false,
  "auto_delete_timer" integer,
  "created_by" integer REFERENCES "users"("id"),
  "created_at" timestamp with time zone DEFAULT NOW(),
  "updated_at" timestamp with time zone DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "chats_type_idx" ON "chats" ("type");
CREATE INDEX IF NOT EXISTS "chats_invite_link_idx" ON "chats" ("invite_link");

CREATE TABLE IF NOT EXISTS "chat_members" (
  "id" serial PRIMARY KEY,
  "chat_id" integer NOT NULL REFERENCES "chats"("id") ON DELETE CASCADE,
  "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "role" varchar(50) DEFAULT 'member',
  "joined_at" timestamp with time zone DEFAULT NOW(),
  "pinned_at" timestamp with time zone,
  "archived_at" timestamp with time zone,
  UNIQUE("chat_id","user_id")
);
CREATE INDEX IF NOT EXISTS "chat_members_chat_id_idx" ON "chat_members" ("chat_id");
CREATE INDEX IF NOT EXISTS "chat_members_user_id_idx" ON "chat_members" ("user_id");
CREATE INDEX IF NOT EXISTS "chat_members_pinned_at_idx" ON "chat_members" ("pinned_at");
CREATE INDEX IF NOT EXISTS "chat_members_archived_at_idx" ON "chat_members" ("archived_at");

CREATE TABLE IF NOT EXISTS "messages" (
  "id" serial PRIMARY KEY,
  "chat_id" integer NOT NULL REFERENCES "chats"("id") ON DELETE CASCADE,
  "sender_id" integer REFERENCES "users"("id") ON DELETE SET NULL,
  "content" text,
  "message_type" varchar(50) DEFAULT 'text',
  "media_url" varchar(500),
  "entities" jsonb,
  "reply_to" integer REFERENCES "messages"("id") ON DELETE SET NULL,
  "is_edited" boolean DEFAULT false,
  "is_deleted" boolean DEFAULT false,
  "is_silent" boolean DEFAULT false,
  "encrypted_payload" text,
  "deleted_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT NOW(),
  "updated_at" timestamp with time zone DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "messages_chat_id_idx" ON "messages" ("chat_id");
CREATE INDEX IF NOT EXISTS "messages_sender_id_idx" ON "messages" ("sender_id");
CREATE INDEX IF NOT EXISTS "messages_created_at_idx" ON "messages" ("created_at");

CREATE TABLE IF NOT EXISTS "message_reads" (
  "id" serial PRIMARY KEY,
  "message_id" integer NOT NULL REFERENCES "messages"("id") ON DELETE CASCADE,
  "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "read_at" timestamp with time zone DEFAULT NOW(),
  UNIQUE("message_id","user_id")
);

CREATE TABLE IF NOT EXISTS "sessions" (
  "id" serial PRIMARY KEY,
  "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "token" varchar(255) NOT NULL UNIQUE,
  "refresh_token" varchar(255) UNIQUE,
  "device_info" text,
  "ip_address" varchar(45),
  "expires_at" timestamp with time zone NOT NULL,
  "created_at" timestamp with time zone DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "sessions_token_idx" ON "sessions" ("token");
CREATE INDEX IF NOT EXISTS "sessions_refresh_token_idx" ON "sessions" ("refresh_token");
CREATE INDEX IF NOT EXISTS "sessions_user_id_idx" ON "sessions" ("user_id");

CREATE TABLE IF NOT EXISTS "reactions" (
  "id" serial PRIMARY KEY,
  "message_id" integer NOT NULL REFERENCES "messages"("id") ON DELETE CASCADE,
  "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "emoji" varchar(50) NOT NULL,
  "created_at" timestamp with time zone DEFAULT NOW(),
  UNIQUE("message_id","user_id","emoji")
);
CREATE INDEX IF NOT EXISTS "reactions_message_id_idx" ON "reactions" ("message_id");

CREATE TABLE IF NOT EXISTS "files" (
  "id" serial PRIMARY KEY,
  "chat_id" integer REFERENCES "chats"("id") ON DELETE CASCADE,
  "message_id" integer REFERENCES "messages"("id") ON DELETE CASCADE,
  "uploader_id" integer REFERENCES "users"("id") ON DELETE SET NULL,
  "file_key" varchar(500) NOT NULL,
  "file_name" varchar(255),
  "mime_type" varchar(100),
  "size" integer,
  "url" varchar(1000) NOT NULL,
  "created_at" timestamp with time zone DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "files_chat_id_idx" ON "files" ("chat_id");
CREATE INDEX IF NOT EXISTS "files_message_id_idx" ON "files" ("message_id");

CREATE TABLE IF NOT EXISTS "chat_folders" (
  "id" serial PRIMARY KEY,
  "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "name" varchar(100) NOT NULL,
  "icon" varchar(50),
  "color" varchar(50),
  "include_types" text DEFAULT '',
  "exclude_muted" boolean DEFAULT false,
  "sort_order" integer DEFAULT 0,
  "created_at" timestamp with time zone DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "chat_folders_user_id_idx" ON "chat_folders" ("user_id");

CREATE TABLE IF NOT EXISTS "folder_chats" (
  "folder_id" integer NOT NULL REFERENCES "chat_folders"("id") ON DELETE CASCADE,
  "chat_id" integer NOT NULL REFERENCES "chats"("id") ON DELETE CASCADE,
  CONSTRAINT "folder_chats_folder_id_chat_id_pk" PRIMARY KEY("folder_id","chat_id")
);

CREATE TABLE IF NOT EXISTS "signal_identity" (
  "id" serial PRIMARY KEY,
  "user_id" integer NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,
  "registration_id" integer NOT NULL,
  "public_key" text NOT NULL,
  "private_key" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT NOW(),
  "updated_at" timestamp with time zone DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "signal_identity_user_id_idx" ON "signal_identity" ("user_id");

CREATE TABLE IF NOT EXISTS "signal_signed_prekey" (
  "id" serial PRIMARY KEY,
  "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "key_id" integer NOT NULL,
  "public_key" text NOT NULL,
  "private_key" text NOT NULL,
  "signature" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "signal_signed_prekey_user_id_idx" ON "signal_signed_prekey" ("user_id");
CREATE INDEX IF NOT EXISTS "signal_signed_prekey_user_key_id_idx" ON "signal_signed_prekey" ("user_id", "key_id");

CREATE TABLE IF NOT EXISTS "signal_prekey" (
  "id" serial PRIMARY KEY,
  "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "key_id" integer NOT NULL,
  "public_key" text NOT NULL,
  "private_key" text NOT NULL,
  "used" boolean DEFAULT false,
  "created_at" timestamp with time zone DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "signal_prekey_user_id_idx" ON "signal_prekey" ("user_id");
CREATE INDEX IF NOT EXISTS "signal_prekey_user_key_id_idx" ON "signal_prekey" ("user_id", "key_id");

CREATE TABLE IF NOT EXISTS "signal_session" (
  "id" serial PRIMARY KEY,
  "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "chat_id" integer NOT NULL REFERENCES "chats"("id") ON DELETE CASCADE,
  "remote_user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "remote_registration_id" integer NOT NULL,
  "remote_identity_public" text NOT NULL,
  "root_key" text NOT NULL,
  "sending_chain_key" text,
  "receiving_chain_key" text,
  "sending_message_number" integer DEFAULT 0,
  "receiving_message_number" integer DEFAULT 0,
  "skipped_message_keys" text DEFAULT '{}',
  "created_at" timestamp with time zone DEFAULT NOW(),
  "updated_at" timestamp with time zone DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "signal_session_user_chat_idx" ON "signal_session" ("user_id", "chat_id");

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
`;
