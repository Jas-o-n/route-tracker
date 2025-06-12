ALTER TABLE "routes" ADD COLUMN "from_place_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "routes" ADD COLUMN "to_place_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "routes" ADD COLUMN "start_mileage" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "routes" ADD COLUMN "end_mileage" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "routes" ADD COLUMN "distance" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "routes" ADD CONSTRAINT "routes_from_place_id_places_id_fk" FOREIGN KEY ("from_place_id") REFERENCES "public"."places"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routes" ADD CONSTRAINT "routes_to_place_id_places_id_fk" FOREIGN KEY ("to_place_id") REFERENCES "public"."places"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routes" DROP COLUMN "start_location";--> statement-breakpoint
ALTER TABLE "routes" DROP COLUMN "destination";--> statement-breakpoint
ALTER TABLE "routes" DROP COLUMN "mileage";