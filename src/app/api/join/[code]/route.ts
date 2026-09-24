import { z } from "zod";
import { claimSeat } from "@/lib/accounts";
import { handle, json } from "@/lib/http";

const schema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  fullName: z.string().trim().min(2, "Enter your name").max(80),
});

export const POST = handle(async (req: Request, { params }: { params: Promise<{ code: string }> }) => {
  const { code } = await params;
  const { email, fullName } = schema.parse(await req.json());
  const token = await claimSeat(code, email, fullName);
  return json({ token });
});
