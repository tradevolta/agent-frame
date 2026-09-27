ALTER TABLE "generation_jobs" ADD COLUMN "attempts" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "generation_jobs" ADD COLUMN "next_attempt_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "generation_jobs" ADD COLUMN "error" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "attempts" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "next_attempt_at" timestamp with time zone;--> statement-breakpoint
CREATE INDEX "jobs_next_attempt_idx" ON "generation_jobs" USING btree ("status","next_attempt_at");--> statement-breakpoint
CREATE INDEX "orders_next_attempt_idx" ON "orders" USING btree ("next_attempt_at");