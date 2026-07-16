CREATE TYPE "public"."category_slug" AS ENUM('popular', 'isekai', 'drama', 'action', 'fantasy', 'slice-of-life', 'mecha', 'romance');--> statement-breakpoint
CREATE TABLE "categories" (
	"slug" "category_slug" PRIMARY KEY NOT NULL,
	"name" varchar(64) NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ledgers" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"label" varchar(160) NOT NULL,
	"amount" integer NOT NULL,
	"currency" varchar(8) DEFAULT 'USD' NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pledges" (
	"id" serial PRIMARY KEY NOT NULL,
	"tier_id" integer NOT NULL,
	"project_id" integer NOT NULL,
	"backer_clerk_user_id" varchar(255) NOT NULL,
	"backer_name" varchar(128) DEFAULT 'Anonymous' NOT NULL,
	"amount" integer NOT NULL,
	"currency" varchar(8) DEFAULT 'USD' NOT NULL,
	"reward" text DEFAULT '' NOT NULL,
	"status" varchar(16) DEFAULT 'confirmed' NOT NULL,
	"payment_ref" varchar(64) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_blocks" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"type" varchar(32) DEFAULT 'text' NOT NULL,
	"content" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_categories" (
	"project_id" integer NOT NULL,
	"category" "category_slug" NOT NULL,
	CONSTRAINT "project_categories_project_id_category_pk" PRIMARY KEY("project_id","category")
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"studio_id" integer NOT NULL,
	"slug" varchar(160) NOT NULL,
	"title" varchar(160) NOT NULL,
	"tagline" varchar(200) DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"cover_image_url" varchar(512) DEFAULT '' NOT NULL,
	"category" "category_slug" DEFAULT 'popular' NOT NULL,
	"goal_amount" integer DEFAULT 0 NOT NULL,
	"currency" varchar(8) DEFAULT 'USD' NOT NULL,
	"status" varchar(16) DEFAULT 'draft' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"ends_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "projects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "studios" (
	"id" serial PRIMARY KEY NOT NULL,
	"clerk_user_id" varchar(255) NOT NULL,
	"name" varchar(128) NOT NULL,
	"slug" varchar(128) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"logo_url" varchar(512) DEFAULT '' NOT NULL,
	"website" varchar(512) DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "studios_clerk_user_id_unique" UNIQUE("clerk_user_id"),
	CONSTRAINT "studios_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "tiers" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"title" varchar(120) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"price" integer NOT NULL,
	"currency" varchar(8) DEFAULT 'USD' NOT NULL,
	"limited_quantity" integer,
	"claimed_quantity" integer DEFAULT 0 NOT NULL,
	"reward" text DEFAULT '' NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ledgers" ADD CONSTRAINT "ledgers_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pledges" ADD CONSTRAINT "pledges_tier_id_tiers_id_fk" FOREIGN KEY ("tier_id") REFERENCES "public"."tiers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pledges" ADD CONSTRAINT "pledges_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_blocks" ADD CONSTRAINT "project_blocks_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_categories" ADD CONSTRAINT "project_categories_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_studio_id_studios_id_fk" FOREIGN KEY ("studio_id") REFERENCES "public"."studios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tiers" ADD CONSTRAINT "tiers_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;