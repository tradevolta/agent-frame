-- Lock every table against Supabase's public Data API (anon / authenticated keys).
-- RLS on with no policies = no access for those roles. The app connects as the
-- table owner, which bypasses RLS, so the app itself is unaffected.
ALTER TABLE "teams" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "orders" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "uploads" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "generation_jobs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "photos" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "subscriptions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "leads" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "processed_events" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "site_assets" ENABLE ROW LEVEL SECURITY;
