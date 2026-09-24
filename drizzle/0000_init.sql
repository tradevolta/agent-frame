CREATE TABLE "processed_events" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "generation_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"style" text NOT NULL,
	"num_images" integer NOT NULL,
	"request_id" text,
	"status" text DEFAULT 'queued' NOT NULL,
	"is_redo" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"source" text NOT NULL,
	"meta" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token" text NOT NULL,
	"email" text,
	"plan" text NOT NULL,
	"status" text DEFAULT 'pending_payment' NOT NULL,
	"amount_cents" integer DEFAULT 0 NOT NULL,
	"stripe_session_id" text,
	"stripe_payment_intent" text,
	"team_id" uuid,
	"subscription_id" uuid,
	"subject" text,
	"attire" text,
	"backdrop_color" text,
	"styles" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"profile" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"lora_url" text,
	"training_request_id" text,
	"training_zip" jsonb,
	"training_started_at" timestamp with time zone,
	"redos_remaining" integer DEFAULT 0 NOT NULL,
	"referral_code" text,
	"referred_by" text,
	"referral_count" integer DEFAULT 0 NOT NULL,
	"est_cost_cents" integer DEFAULT 0 NOT NULL,
	"error" text,
	"uploads_purged_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "orders_token_unique" UNIQUE("token"),
	CONSTRAINT "orders_referral_code_unique" UNIQUE("referral_code")
);
--> statement-breakpoint
CREATE TABLE "photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"job_id" uuid,
	"style" text NOT NULL,
	"url" text NOT NULL,
	"pathname" text,
	"favorite" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token" text NOT NULL,
	"email" text NOT NULL,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"status" text DEFAULT 'active' NOT NULL,
	"current_period_end" timestamp with time zone,
	"last_shoot_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "subscriptions_token_unique" UNIQUE("token"),
	CONSTRAINT "subscriptions_stripe_subscription_id_unique" UNIQUE("stripe_subscription_id")
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token" text NOT NULL,
	"join_code" text NOT NULL,
	"name" text NOT NULL,
	"manager_email" text NOT NULL,
	"seats" integer NOT NULL,
	"seats_used" integer DEFAULT 0 NOT NULL,
	"team_style" text,
	"backdrop_color" text,
	"status" text DEFAULT 'pending_payment' NOT NULL,
	"stripe_session_id" text,
	"amount_cents" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "teams_token_unique" UNIQUE("token"),
	CONSTRAINT "teams_join_code_unique" UNIQUE("join_code")
);
--> statement-breakpoint
CREATE TABLE "uploads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"url" text NOT NULL,
	"pathname" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "generation_jobs" ADD CONSTRAINT "generation_jobs_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "photos" ADD CONSTRAINT "photos_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "photos" ADD CONSTRAINT "photos_job_id_generation_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."generation_jobs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "uploads" ADD CONSTRAINT "uploads_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "jobs_order_idx" ON "generation_jobs" USING btree ("order_id");--> statement-breakpoint
CREATE UNIQUE INDEX "jobs_request_idx" ON "generation_jobs" USING btree ("request_id");--> statement-breakpoint
CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "orders_email_idx" ON "orders" USING btree ("email");--> statement-breakpoint
CREATE INDEX "photos_order_idx" ON "photos" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "uploads_order_idx" ON "uploads" USING btree ("order_id");