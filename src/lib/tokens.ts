import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { env } from "./env";

/** Unguessable capability token (used in studio / team / account links). */
export function randomToken(bytes = 24): string {
  return randomBytes(bytes).toString("base64url");
}

/** Short human-friendly code for referral and join links (no ambiguous chars). */
export function shortCode(length = 7): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(length);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

export function sign(value: string, secret: string = env.signingSecret): string {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

export function verify(value: string, signature: string | null | undefined, secret: string = env.signingSecret): boolean {
  if (!signature) return false;
  const expected = Buffer.from(sign(value, secret));
  const given = Buffer.from(signature);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

const TOKEN_RE = /^[A-Za-z0-9_-]{16,64}$/;
export function isToken(v: unknown): v is string {
  return typeof v === "string" && TOKEN_RE.test(v);
}
