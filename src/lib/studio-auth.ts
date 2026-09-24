import "server-only";
import { getOrderByToken, UserError } from "./pipeline";
import { isToken } from "./tokens";

export async function orderFromParams(params: Promise<{ token: string }>) {
  const { token } = await params;
  if (!isToken(token)) throw new UserError("Invalid studio link.");
  const order = await getOrderByToken(token);
  if (!order) throw new UserError("Studio not found.");
  return order;
}
