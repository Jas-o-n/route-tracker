CREATE TABLE "routes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"start_location" text NOT NULL,
	"destination" text NOT NULL,
	"mileage" integer NOT NULL,
	"date" timestamp DEFAULT now() NOT NULL,
	"notes" text,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
