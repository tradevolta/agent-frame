import { getSubscriptionByToken, startSubscriptionShoot } from "@/lib/accounts";
import { UserError } from "@/lib/pipeline";
import { isToken } from "@/lib/tokens";
import { handle, json } from "@/lib/http";

export const POST = handle(async (_req: Request, { params }: { params: Promise<{ token: string }> }) => {
  const { token } = await params;
  const sub = isToken(token) ? await getSubscriptionByToken(token) : undefined;
  if (!sub) throw new UserError("Account not found.");
  return json({ token: await startSubscriptionShoot(sub) });
});
