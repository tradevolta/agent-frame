import { z } from "zod";
import { ADMIN_COOKIE, SESSION_DAYS, createSession, passwordMatches } from "@/lib/admin-session";

const schema = z.object({ password: z.string().min(1).max(200) });

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!process.env.ADMIN_PASSWORD) return Response.json({ error: "ADMIN_PASSWORD isn't set in Vercel." }, { status: 503 });
  if (!parsed.success || !passwordMatches(parsed.data.password)) {
    await new Promise((r) => setTimeout(r, 600)); // slow down guessing
    return Response.json({ error: "Wrong password." }, { status: 401 });
  }
  const token = await createSession();
  const res = Response.json({ ok: true });
  res.headers.append(
    "Set-Cookie",
    `${ADMIN_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_DAYS * 86400}${process.env.NODE_ENV === "production" ? "; Secure" : ""}`,
  );
  return res;
}
