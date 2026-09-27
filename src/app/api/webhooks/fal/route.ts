import { parseFalWebhook } from "@/lib/ai";
import { after } from "next/server";
import { claimSlot, handleGenerationResult, handleTrainingResult, processQueue } from "@/lib/pipeline";
import { verify } from "@/lib/tokens";

export const maxDuration = 120;

// fal.ai calls this when a training or generation request finishes. The URL
// carries an HMAC we generated at submit time, so only our own jobs are accepted.
export async function POST(req: Request) {
  const url = new URL(req.url);
  const kind = url.searchParams.get("kind");
  const id = url.searchParams.get("id") ?? "";
  if ((kind !== "train" && kind !== "gen") || !verify(`${kind}:${id}`, url.searchParams.get("sig"))) {
    return new Response("Forbidden", { status: 403 });
  }
  const result = parseFalWebhook(await req.json().catch(() => null));
  if (!result) return new Response("Bad payload", { status: 400 });
  if (kind === "train") await handleTrainingResult(id, result);
  else await handleGenerationResult(id, result);
  // fal.ai is answering again: submit anything waiting in the retry queue.
  if (result.ok) {
    after(async () => {
      if (await claimSlot("queue:webhook", 30)) await processQueue().catch((e) => console.error("[queue]", e));
    });
  }
  return Response.json({ ok: true });
}
