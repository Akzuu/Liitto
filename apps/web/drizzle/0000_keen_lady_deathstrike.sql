CREATE TABLE "guest" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invitation_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"attending" boolean,
	"dietary_restrictions" text,
	"photography_consent" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invitation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(9) NOT NULL,
	"primary_guest_name" varchar(255) NOT NULL,
	"max_guests" integer DEFAULT 2 NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "invitation_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "rsvp" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invitation_id" uuid NOT NULL,
	"email" varchar(255) NOT NULL,
	"attending" boolean NOT NULL,
	"guest_count" integer DEFAULT 0 NOT NULL,
	"message" text,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "rsvp_invitation_id_unique" UNIQUE("invitation_id")
);
--> statement-breakpoint
ALTER TABLE "guest" ADD CONSTRAINT "guest_invitation_id_invitation_id_fk" FOREIGN KEY ("invitation_id") REFERENCES "public"."invitation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rsvp" ADD CONSTRAINT "rsvp_invitation_id_invitation_id_fk" FOREIGN KEY ("invitation_id") REFERENCES "public"."invitation"("id") ON DELETE cascade ON UPDATE no action;