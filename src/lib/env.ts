// Feature switches. Every external service has a local "mock" fallback so the
// whole purchase → upload → generate → deliver flow runs without API keys.
export const env = {
  isProd: process.env.NODE_ENV === "production",
  databaseUrl: process.env.DATABASE_URL,
  stripeSecret: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  referralCouponId: process.env.STRIPE_REFERRAL_COUPON_ID,
  falKey: process.env.FAL_KEY,
  falTrainer: process.env.FAL_TRAINER_MODEL || "fal-ai/flux-lora-portrait-trainer",
  falTrainingSteps: Number(process.env.FAL_TRAINING_STEPS || 2000),
  blobToken: process.env.BLOB_READ_WRITE_TOKEN,
  // Zoho Mail SMTP. Custom-domain (organization) accounts use smtppro.zoho.com;
  // free personal accounts use smtp.zoho.com; EU/India data centers use .eu / .in.
  smtpHost: process.env.SMTP_HOST || "smtppro.zoho.com",
  smtpPort: Number(process.env.SMTP_PORT || 465),
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,
  emailFrom: process.env.EMAIL_FROM || process.env.SMTP_USER || "AgentFrame <studio@agentframe.ai>",
  get signingSecret(): string {
    const secret = process.env.APP_SIGNING_SECRET;
    if (!secret && process.env.NODE_ENV === "production") throw new Error("APP_SIGNING_SECRET must be set in production");
    return secret || "dev-insecure-signing-secret";
  },
  cronSecret: process.env.CRON_SECRET,
  adminPassword: process.env.ADMIN_PASSWORD,
  // Mock payments are never allowed in production unless explicitly forced.
  allowMockPayments:
    !process.env.STRIPE_SECRET_KEY &&
    (process.env.NODE_ENV !== "production" || process.env.ALLOW_MOCK_PAYMENTS === "true"),
};

export const isMockAi = () => !env.falKey;
export const isMockStorage = () => !env.blobToken;
