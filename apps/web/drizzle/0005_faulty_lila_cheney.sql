CREATE TABLE "wedding_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rsvp_deadline" varchar(20) NOT NULL,
	"wedding_date" varchar(20),
	"bride_name" varchar(255),
	"groom_name" varchar(255),
	"venue" text,
	"ceremony_time" varchar(50),
	"reception_time" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
