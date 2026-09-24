import { z } from "zod";
import { submitOrder } from "@/lib/pipeline";
import { orderFromParams } from "@/lib/studio-auth";
import { handle, json } from "@/lib/http";

export const maxDuration = 120;

const schema = z.object({
  subject: z.enum(["woman", "man", "person"]),
  attire: z.enum(["formal", "business_casual", "style_default"]),
  backdropColor: z.string().max(20).optional(),
  styles: z.array(z.string().max(40)).max(20),
  consent: z.literal(true, { message: "Please confirm these are photos of you." }),
});

export const POST = handle(async (req: Request, { params }: { params: Promise<{ token: string }> }) => {
  const order = await orderFromParams(params);
  const body = schema.parse(await req.json());
  await submitOrder(order, body);
  return json({ ok: true });
});
