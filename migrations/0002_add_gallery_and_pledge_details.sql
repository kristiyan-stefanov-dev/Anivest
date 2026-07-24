CREATE TABLE "project_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"image_url" varchar(512) NOT NULL,
	"alt_text" varchar(256) DEFAULT '' NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tiers" ADD COLUMN "image_url" varchar(512) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "tiers" ADD COLUMN "delivery_date" varchar(64) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "pledges" ADD COLUMN "email" varchar(256) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "pledges" ADD COLUMN "address" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "pledges" ADD COLUMN "notes" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "project_images" ADD CONSTRAINT "project_images_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
