import "server-only";
import { env, isMockAi } from "./env";
import { TRIGGER } from "./styles";

// Thin wrapper over fal.ai's queue API. Training: a per-customer FLUX LoRA
// (the approach used by the leading headshot products). Generation: FLUX + LoRA.

export const GEN_MODEL = "fal-ai/flux-lora";
export const MAX_IMAGES_PER_REQUEST = 4;

export interface FalWebhook {
  requestId: string;
  ok: boolean;
  output: unknown;
  error?: string;
}

async function falClient() {
  const { fal } = await import("@fal-ai/client");
  fal.config({ credentials: env.falKey });
  return fal;
}

export async function submitTraining(zipUrl: string, webhookUrl: string): Promise<string> {
  if (isMockAi()) return `mock-train-${Date.now()}`;
  const fal = await falClient();
  const isPortrait = env.falTrainer.includes("portrait");
  const input = isPortrait
    ? { images_data_url: zipUrl, trigger_phrase: TRIGGER, steps: env.falTrainingSteps, subject_crop: true }
    : { images_data_url: zipUrl, trigger_word: TRIGGER, steps: env.falTrainingSteps, create_masks: true };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res = await fal.queue.submit(env.falTrainer as any, { input: input as any, webhookUrl });
  return res.request_id;
}

export interface GenerateArgs {
  prompt: string;
  loraUrl: string;
  numImages: number;
  webhookUrl: string;
}

export async function submitGeneration(args: GenerateArgs): Promise<string> {
  if (isMockAi()) return `mock-gen-${crypto.randomUUID()}`;
  const fal = await falClient();
  const res = await fal.queue.submit(GEN_MODEL, {
    input: {
      prompt: args.prompt,
      loras: [{ path: args.loraUrl, scale: 1 }],
      num_images: Math.min(args.numImages, MAX_IMAGES_PER_REQUEST),
      image_size: "portrait_4_3",
      num_inference_steps: 28,
      guidance_scale: 3.5,
      output_format: "jpeg",
      enable_safety_checker: true,
    },
    webhookUrl: args.webhookUrl,
  });
  return res.request_id;
}

/** Normalise a fal webhook body. */
export function parseFalWebhook(body: unknown): FalWebhook | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  const requestId = (b.request_id ?? b.gateway_request_id) as string | undefined;
  if (!requestId) return null;
  const ok = b.status === "OK";
  const error = ok ? undefined : String(b.error ?? JSON.stringify(b.payload ?? "unknown error")).slice(0, 500);
  return { requestId, ok, output: b.payload, error };
}

/** Polling fallback for when a webhook was missed. Returns null while still running. */
export async function fetchResult(endpoint: string, requestId: string): Promise<FalWebhook | null> {
  if (isMockAi()) return null;
  const fal = await falClient();
  const status = await fal.queue.status(endpoint, { requestId });
  if (status.status !== "COMPLETED") return null;
  try {
    const result = await fal.queue.result(endpoint, { requestId });
    return { requestId, ok: true, output: result.data };
  } catch (err) {
    return { requestId, ok: false, output: null, error: String(err).slice(0, 500) };
  }
}

export function extractLoraUrl(output: unknown): string | null {
  const o = output as { diffusers_lora_file?: { url?: string } } | null;
  return o?.diffusers_lora_file?.url ?? null;
}

export const UPSCALE_MODEL = "fal-ai/esrgan";

/**
 * 4x photo upscale (Real-ESRGAN) for large prints: generated headshots are
 * about 768x1024, too small for a sign rider or an 8x10 at 300 DPI.
 * Returns fal's temporary URL; callers persist it. Mock mode returns the input.
 */
export async function upscaleImage(imageUrl: string): Promise<string> {
  if (isMockAi()) return imageUrl;
  const fal = await falClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res = await fal.subscribe(UPSCALE_MODEL as any, { input: { image_url: imageUrl, scale: 4, model: "RealESRGAN_x4plus", face: true } as any });
  const out = res.data as { image?: { url?: string }; images?: { url: string }[] };
  const url = out.image?.url ?? out.images?.[0]?.url;
  if (!url) throw new Error("Upscaler returned no image");
  return url;
}

export function extractImages(output: unknown): string[] {
  const o = output as { images?: { url: string }[]; has_nsfw_concepts?: boolean[] } | null;
  if (!o?.images) return [];
  return o.images.filter((_, i) => !o.has_nsfw_concepts?.[i]).map((img) => img.url);
}

/**
 * Human-readable reason from a fal.ai error, including the response body
 * (e.g. "User is locked. Reason: Exhausted balance") and a hint for 401/403.
 */
export function describeFalError(err: unknown): string {
  const e = err as { status?: number; body?: unknown; message?: string };
  const body = e?.body as { detail?: unknown } | string | undefined;
  let detail = "";
  if (typeof body === "string") detail = body;
  else if (body && typeof body === "object") {
    const d = (body as { detail?: unknown }).detail;
    detail = typeof d === "string" ? d : JSON.stringify(d ?? body);
  }
  const base = [e?.status ? `fal.ai ${e.status}` : "fal.ai error", detail || e?.message || String(err)].join(": ");
  if (e?.status === 401) return `${base}. The FAL_KEY is wrong: it should look like key_id:key_secret.`;
  if (e?.status === 403 && /exhausted balance/i.test(base)) {
    return `${base} If your fal.ai dashboard shows credit, the lock can lag a top-up by up to an hour: retry later, and contact fal.ai support if it persists. Also check the key was created under the account or team that holds the credit.`;
  }
  if (e?.status === 403) return `${base}. Usually no credit on the fal.ai account (add credit under Billing) or a key without API scope.`;
  return base.slice(0, 400);
}

/**
 * Worth retrying later: network errors, timeouts, rate limits, fal.ai outages,
 * and account problems the owner can fix (bad key, locked or empty balance).
 * Anything else (e.g. 422 invalid input) fails right away.
 */
export function isRetryableFalError(err: unknown): boolean {
  const status = (err as { status?: number })?.status;
  if (!status) return true;
  return status === 401 || status === 403 || status === 408 || status === 409 || status === 425 || status === 429 || status >= 500;
}
