import { env } from "@/lib/env";
import { getStripe, handleStripeEvent } from "@/lib/payments";

export async function POST(req: Request) {
  if (!env.stripeWebhookSecret) return new Response("Stripe webhook not configured", { status: 500 });
  const body = await req.text();
  let event;
  try {
    event = await getStripe().webhooks.constructEventAsync(body, req.headers.get("stripe-signature") ?? "", env.stripeWebhookSecret);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }
  try {
    await handleStripeEvent(event);
  } catch (err) {
    console.error("[stripe webhook]", event.type, err);
    return new Response("Handler error", { status: 500 });
  }
  return Response.json({ received: true });
}
