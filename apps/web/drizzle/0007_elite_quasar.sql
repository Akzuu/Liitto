ALTER TABLE "invitation_session" ALTER COLUMN "expires_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "invitation_session" ALTER COLUMN "last_accessed_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "invitation_session" ALTER COLUMN "last_accessed_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "invitation_session" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "invitation_session" ALTER COLUMN "created_at" SET DEFAULT now();