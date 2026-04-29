CREATE TABLE "signal_identity" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"registration_id" integer NOT NULL,
	"public_key" text NOT NULL,
	"private_key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "signal_identity_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "signal_prekey" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"key_id" integer NOT NULL,
	"public_key" text NOT NULL,
	"private_key" text NOT NULL,
	"used" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "signal_session" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"chat_id" integer NOT NULL,
	"remote_user_id" integer NOT NULL,
	"remote_registration_id" integer NOT NULL,
	"remote_identity_public" text NOT NULL,
	"root_key" text NOT NULL,
	"sending_chain_key" text,
	"receiving_chain_key" text,
	"sending_message_number" integer DEFAULT 0,
	"receiving_message_number" integer DEFAULT 0,
	"skipped_message_keys" text DEFAULT '{}',
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "signal_signed_prekey" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"key_id" integer NOT NULL,
	"public_key" text NOT NULL,
	"private_key" text NOT NULL,
	"signature" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "signal_identity" ADD CONSTRAINT "signal_identity_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "signal_prekey" ADD CONSTRAINT "signal_prekey_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "signal_session" ADD CONSTRAINT "signal_session_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "signal_session" ADD CONSTRAINT "signal_session_chat_id_chats_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "signal_session" ADD CONSTRAINT "signal_session_remote_user_id_users_id_fk" FOREIGN KEY ("remote_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "signal_signed_prekey" ADD CONSTRAINT "signal_signed_prekey_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "signal_identity_user_id_idx" ON "signal_identity" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "signal_prekey_user_id_idx" ON "signal_prekey" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "signal_prekey_user_key_id_idx" ON "signal_prekey" USING btree ("user_id","key_id");--> statement-breakpoint
CREATE INDEX "signal_session_user_chat_idx" ON "signal_session" USING btree ("user_id","chat_id");--> statement-breakpoint
CREATE INDEX "signal_signed_prekey_user_id_idx" ON "signal_signed_prekey" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "signal_signed_prekey_user_key_id_idx" ON "signal_signed_prekey" USING btree ("user_id","key_id");