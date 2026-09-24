import { z } from "zod";
import { redoStyle } from "@/lib/pipeline";
import { orderFromParams } from "@/lib/studio-auth";
import { handle, json } from "@/lib/http";

export const maxDuration = 60;

export const POST = handle(async (req: Request, { params }: { params: Promise<{ token: string }> }) => {
  const order = await orderFromParams(params);
  const { style } = z.object({ style: z.string().max(40) }).parse(await req.json());
  await redoStyle(order, style);
  return json({ ok: true });
});
