import { z } from "zod";
import { createCheckout } from "@/lib/payments";
import { handle, json } from "@/lib/http";

const email = z.string().trim().toLowerCase().email("Enter a valid email");
const schema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("order"), plan: z.enum(["starter", "pro"]), email: email.optional().or(z.literal("")), ref: z.string().max(20).optional() }),
  z.object({
    kind: z.literal("team"),
    seats: z.coerce.number().int(),
    teamName: z.string().trim().min(2, "Enter your brokerage or team name").max(120),
    email,
    teamStyle: z.string().max(40).optional(),
    backdropColor: z.string().max(20).optional(),
  }),
  z.object({ kind: z.literal("subscription"), email: email.optional().or(z.literal("")) }),
]);

export const POST = handle(async (req: Request) => {
  const body = schema.parse(await req.json());
  const url = await createCheckout(
    body.kind === "team" ? body : { ...body, email: body.email || undefined },
  );
  return json({ url });
});
