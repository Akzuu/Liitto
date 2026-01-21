CREATE TABLE "email_verification_code" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invitation_id" uuid NOT NULL,
	"email" varchar(255) NOT NULL,
	"code" varchar(255) NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp NOT NULL,
	"verified_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invitation_session" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invitation_id" uuid NOT NULL,
	"token" varchar(255) NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"expires_at" timestamp NOT NULL,
	"last_accessed_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "invitation_session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "email_verification_code" ADD CONSTRAINT "email_verification_code_invitation_id_invitation_id_fk" FOREIGN KEY ("invitation_id") REFERENCES "public"."invitation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation_session" ADD CONSTRAINT "invitation_session_invitation_id_invitation_id_fk" FOREIGN KEY ("invitation_id") REFERENCES "public"."invitation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "email_verification_code_invitationId_idx" ON "email_verification_code" USING btree ("invitation_id");--> statement-breakpoint
CREATE INDEX "invitation_session_token_idx" ON "invitation_session" USING btree ("token");--> statement-breakpoint
CREATE INDEX "invitation_session_invitationId_idx" ON "invitation_session" USING btree ("invitation_id");