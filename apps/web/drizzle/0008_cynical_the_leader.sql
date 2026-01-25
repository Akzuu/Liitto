ALTER TABLE "wedding_settings" ADD COLUMN "venue_name" varchar(255);--> statement-breakpoint
ALTER TABLE "wedding_settings" ADD COLUMN "venue_address" text;--> statement-breakpoint
ALTER TABLE "wedding_settings" ADD COLUMN "schedule" json;--> statement-breakpoint
ALTER TABLE "wedding_settings" DROP COLUMN "venue";--> statement-breakpoint
ALTER TABLE "wedding_settings" DROP COLUMN "reception_time";