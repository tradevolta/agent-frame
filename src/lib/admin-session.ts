// Admin session cookie: `<expiry>.<hmac>`, signed with a key derived from
// ADMIN_PASSWORD + APP_SIGNING_SECRET, so changing the password logs everyone out.
// Uses Web Crypto so it works in the proxy and in route handlers.

export const ADMIN_COOKIE = "af_admin";
export const SESSION_DAYS = 14;

const enc = new TextEncoder();

async function key(): Promise<CryptoKey | null> {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return null;
  const secret = `${password}|${process.env.APP_SIGNING_SECRET ?? ""}`;
  return crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

const b64url = (buf: ArrayBuffer) =>
  btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

export async function createSession(now = Date.now()): Promise<string | null> {
  const k = await key();
  if (!k) return null;
  const exp = String(now + SESSION_DAYS * 86_400_000);
  const sig = await crypto.subtle.sign("HMAC", k, enc.encode(`admin.${exp}`));
  return `${exp}.${b64url(sig)}`;
}

export async function verifySession(token: string | undefined, now = Date.now()): Promise<boolean> {
  if (!token) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig || !/^\d+$/.test(exp) || Number(exp) < now) return false;
  const k = await key();
  if (!k) return false;
  const expected = b64url(await crypto.subtle.sign("HMAC", k, enc.encode(`admin.${exp}`)));
  return timingSafeEqual(expected, sig);
}

/** Constant-time string comparison. */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function passwordMatches(given: string): boolean {
  const password = process.env.ADMIN_PASSWORD;
  return !!password && timingSafeEqual(given.trim(), password.trim());
}
