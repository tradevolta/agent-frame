CREATE TABLE "site_assets" (
	"key" text PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"pathname" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
