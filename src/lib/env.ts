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
  resendKey: process.env.RESEND_API_KEY,
  emailFrom: process.env.EMAIL_FROM || "AgentFrame <studio@agentframe.ai>",
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
