import { z } from "zod";
import { getDb } from "@/lib/db";
import { leads } from "@/lib/db/schema";
import { handle, json } from "@/lib/http";

const schema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  source: z.string().max(60).default("newsletter"),
});

export const POST = handle(async (req: Request) => {
  const { email, source } = schema.parse(await req.json());
  const db = await getDb();
  await db.insert(leads).values({ email, source });
  return json({ ok: true });
});
