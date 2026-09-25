import { pgTable, text, integer, timestamp, boolean, jsonb, uuid, index, uniqueIndex } from "drizzle-orm/pg-core";

export type OrderStatus =
  | "pending_payment"
  | "awaiting_upload"
  | "training"
  | "generating"
  | "completed"
  | "failed"
  | "refunded";

export interface AgentProfile {
  fullName?: string;
  title?: string;
  brokerage?: string;
  phone?: string;
  email?: string;
  website?: string;
  licenseNumber?: string;
  brandColor?: string; // hex
}

export const teams = pgTable("teams", {
  id: uuid("id").primaryKey().defaultRandom(),
  token: text("token").notNull().unique(), // manager dashboard capability
  joinCode: text("join_code").notNull().unique(), // agent invite capability
  name: text("name").notNull(),
  managerEmail: text("manager_email").notNull(),
  seats: integer("seats").notNull(),
  seatsUsed: integer("seats_used").notNull().default(0),
  teamStyle: text("team_style"),
  backdropColor: text("backdrop_color"),
  status: text("status").notNull().default("pending_payment"),
  stripeSessionId: text("stripe_session_id"),
  amountCents: integer("amount_cents").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    token: text("token").notNull().unique(),
    email: text("email"),
    plan: text("plan").notNull(),
    status: text("status").$type<OrderStatus>().notNull().default("pending_payment"),
    amountCents: integer("amount_cents").notNull().default(0),
    stripeSessionId: text("stripe_session_id"),
    stripePaymentIntent: text("stripe_payment_intent"),
    teamId: uuid("team_id").references(() => teams.id),
    subscriptionId: uuid("subscription_id"),
    subject: text("subject"),
    attire: text("attire"),
    backdropColor: text("backdrop_color"),
    styles: jsonb("styles").$type<string[]>().notNull().default([]),
    profile: jsonb("profile").$type<AgentProfile>().notNull().default({}),
    loraUrl: text("lora_url"),
    trainingRequestId: text("training_request_id"),
    trainingZip: jsonb("training_zip").$type<{ url: string; pathname: string }>(),
    trainingStartedAt: timestamp("training_started_at", { withTimezone: true }),
    redosRemaining: integer("redos_remaining").notNull().default(0),
    referralCode: text("referral_code").unique(),
    referredBy: text("referred_by"),
    referralCount: integer("referral_count").notNull().default(0),
    estCostCents: integer("est_cost_cents").notNull().default(0),
    error: text("error"),
    uploadsPurgedAt: timestamp("uploads_purged_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("orders_status_idx").on(t.status), index("orders_email_idx").on(t.email)],
);

export const uploads = pgTable(
  "uploads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    pathname: text("pathname").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("uploads_order_idx").on(t.orderId)],
);

export const jobs = pgTable(
  "generation_jobs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
    style: text("style").notNull(),
    numImages: integer("num_images").notNull(),
    requestId: text("request_id"),
    status: text("status").$type<"queued" | "submitted" | "processing" | "done" | "failed">().notNull().default("queued"),
    isRedo: boolean("is_redo").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("jobs_order_idx").on(t.orderId), uniqueIndex("jobs_request_idx").on(t.requestId)],
);

export const photos = pgTable(
  "photos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
    jobId: uuid("job_id").references(() => jobs.id, { onDelete: "set null" }),
    style: text("style").notNull(),
    url: text("url").notNull(),
    pathname: text("pathname"),
    favorite: boolean("favorite").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("photos_order_idx").on(t.orderId)],
);

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  token: text("token").notNull().unique(),
  email: text("email").notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id").unique(),
  stripeSessionId: text("stripe_session_id"),
  status: text("status").notNull().default("active"),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
  lastShootAt: timestamp("last_shoot_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const leads = pgTable("leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  source: text("source").notNull(),
  meta: jsonb("meta").$type<Record<string, string>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Site-wide generated assets, e.g. style sample photos (key = "sample:<style-id>"). */
export const siteAssets = pgTable("site_assets", {
  key: text("key").primaryKey(),
  url: text("url").notNull(),
  pathname: text("pathname").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const events = pgTable("processed_events", {
  id: text("id").primaryKey(), // Stripe event id, for webhook idempotency
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Order = typeof orders.$inferSelect;
export type Team = typeof teams.$inferSelect;
export type Photo = typeof photos.$inferSelect;
export type Job = typeof jobs.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
