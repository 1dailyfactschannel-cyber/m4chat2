CREATE TABLE "chat_folders" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"icon" varchar(50),
	"color" varchar(50),
	"include_types" text DEFAULT '',
	"exclude_muted" boolean DEFAULT false,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "chat_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"chat_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"role" varchar(50) DEFAULT 'member',
	"joined_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "chat_members_chat_id_user_id_pk" PRIMARY KEY("chat_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "chats" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"type" varchar(50) DEFAULT 'private',
	"photo" varchar(500),
	"invite_link" varchar(255),
	"pinned_message_id" integer,
	"is_archived" boolean DEFAULT false,
	"created_by" integer,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "chats_invite_link_unique" UNIQUE("invite_link")
);
--> statement-breakpoint
CREATE TABLE "files" (
	"id" serial PRIMARY KEY NOT NULL,
	"chat_id" integer,
	"message_id" integer,
	"uploader_id" integer,
	"file_key" varchar(500) NOT NULL,
	"file_name" varchar(255),
	"mime_type" varchar(100),
	"size" integer,
	"url" varchar(1000) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "folder_chats" (
	"folder_id" integer NOT NULL,
	"chat_id" integer NOT NULL,
	CONSTRAINT "folder_chats_folder_id_chat_id_pk" PRIMARY KEY("folder_id","chat_id")
);
--> statement-breakpoint
CREATE TABLE "message_reads" (
	"id" serial PRIMARY KEY NOT NULL,
	"message_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"read_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "message_reads_message_id_user_id_pk" PRIMARY KEY("message_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"chat_id" integer NOT NULL,
	"sender_id" integer,
	"content" text,
	"message_type" varchar(50) DEFAULT 'text',
	"media_url" varchar(500),
	"reply_to" integer,
	"is_edited" boolean DEFAULT false,
	"is_deleted" boolean DEFAULT false,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "reactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"message_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"emoji" varchar(50) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "reactions_message_id_user_id_emoji_pk" PRIMARY KEY("message_id","user_id","emoji")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"token" varchar(255) NOT NULL,
	"refresh_token" varchar(255),
	"device_info" text,
	"ip_address" varchar(45),
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "sessions_token_unique" UNIQUE("token"),
	CONSTRAINT "sessions_refresh_token_unique" UNIQUE("refresh_token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(100) NOT NULL,
	"email" varchar(255),
	"phone" varchar(50),
	"password_hash" varchar(255),
	"avatar_url" varchar(500),
	"bio" text,
	"is_online" boolean DEFAULT false,
	"last_seen_at" timestamp with time zone,
	"two_fa_secret" varchar(255),
	"two_fa_enabled" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
ALTER TABLE "chat_folders" ADD CONSTRAINT "chat_folders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_members" ADD CONSTRAINT "chat_members_chat_id_chats_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_members" ADD CONSTRAINT "chat_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chats" ADD CONSTRAINT "chats_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_chat_id_chats_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_message_id_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_uploader_id_users_id_fk" FOREIGN KEY ("uploader_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "folder_chats" ADD CONSTRAINT "folder_chats_folder_id_chat_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."chat_folders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "folder_chats" ADD CONSTRAINT "folder_chats_chat_id_chats_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_reads" ADD CONSTRAINT "message_reads_message_id_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_reads" ADD CONSTRAINT "message_reads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_chat_id_chats_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_reply_to_messages_id_fk" FOREIGN KEY ("reply_to") REFERENCES "public"."messages"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_message_id_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "chat_folders_user_id_idx" ON "chat_folders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "chat_members_chat_id_idx" ON "chat_members" USING btree ("chat_id");--> statement-breakpoint
CREATE INDEX "chat_members_user_id_idx" ON "chat_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "chats_type_idx" ON "chats" USING btree ("type");--> statement-breakpoint
CREATE INDEX "chats_invite_link_idx" ON "chats" USING btree ("invite_link");--> statement-breakpoint
CREATE INDEX "files_chat_id_idx" ON "files" USING btree ("chat_id");--> statement-breakpoint
CREATE INDEX "files_message_id_idx" ON "files" USING btree ("message_id");--> statement-breakpoint
CREATE INDEX "messages_chat_id_idx" ON "messages" USING btree ("chat_id");--> statement-breakpoint
CREATE INDEX "messages_sender_id_idx" ON "messages" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "messages_created_at_idx" ON "messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "reactions_message_id_idx" ON "reactions" USING btree ("message_id");--> statement-breakpoint
CREATE INDEX "sessions_token_idx" ON "sessions" USING btree ("token");--> statement-breakpoint
CREATE INDEX "sessions_refresh_token_idx" ON "sessions" USING btree ("refresh_token");--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "users_username_idx" ON "users" USING btree ("username");--> statement-breakpoint
CREATE INDEX "users_phone_idx" ON "users" USING btree ("phone");