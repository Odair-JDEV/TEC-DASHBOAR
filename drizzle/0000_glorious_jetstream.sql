CREATE TABLE "boxes" (
	"id" text PRIMARY KEY NOT NULL,
	"schedule_id" text NOT NULL,
	"number" integer NOT NULL,
	"team" jsonb,
	"status" text,
	"departure_time" text,
	"return_time" text
);
--> statement-breakpoint
CREATE TABLE "schedules" (
	"id" text PRIMARY KEY NOT NULL,
	"date" text NOT NULL,
	"shift" text NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" text PRIMARY KEY NOT NULL,
	"box_id" text NOT NULL,
	"os_number" text NOT NULL,
	"type" text NOT NULL,
	"status" text,
	"completed_at" text
);
--> statement-breakpoint
CREATE TABLE "technicians" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "boxes" ADD CONSTRAINT "boxes_schedule_id_schedules_id_fk" FOREIGN KEY ("schedule_id") REFERENCES "public"."schedules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_box_id_boxes_id_fk" FOREIGN KEY ("box_id") REFERENCES "public"."boxes"("id") ON DELETE cascade ON UPDATE no action;