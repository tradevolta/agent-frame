import { z } from "zod";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { orderFromParams } from "@/lib/studio-auth";
import { handle, json } from "@/lib/http";

const field = (max: number) => z.string().trim().max(max).optional();
const schema = z.object({
  fullName: field(80),
  title: field(80),
  brokerage: field(100),
  phone: field(30),
  email: field(120),
  website: field(120),
  licenseNumber: field(40),
  brandColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

export const POST = handle(async (req: Request, { params }: { params: Promise<{ token: string }> }) => {
  const order = await orderFromParams(params);
  const profile = schema.parse(await req.json());
  const db = await getDb();
  await db.update(orders).set({ profile, updatedAt: new Date() }).where(eq(orders.id, order.id));
  return json({ ok: true });
});
