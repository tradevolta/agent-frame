import "server-only";
import { and, eq, inArray, isNull, lt, notInArray, or, sql } from "drizzle-orm";
import { getDb } from "./db";
import { jobs, leads, orders, photos, teams, uploads, type Job, type Order } from "./db/schema";
import * as ai from "./ai";
import { appUrl } from "./brand";
import { emails } from "./email";
import { isMockAi } from "./env";
import { PLANS, isPlanId } from "./plans";
import { deleteFiles, persistRemote, putFile, readFileBytes } from "./storage";
import { buildPrompt, getStyle, resolveStyles, type Attire, type Subject } from "./styles";
import { randomToken, shortCode, sign } from "./tokens";
import { makeZip } from "./zip";

export const MIN_UPLOADS = 8;
export const MAX_UPLOADS = 20;
const TRAIN_COST_CENTS = Number(process.env.FAL_TRAIN_COST_CENTS || 250);
const IMAGE_COST_CENTS = Number(process.env.FAL_IMAGE_COST_CENTS || 4);

// ---------------------------------------------------------------- lookups

export async function getOrderByToken(token: string): Promise<Order | undefined> {
  const db = await getDb();
  const [o] = await db.select().from(orders).where(eq(orders.token, token)).limit(1);
  return o;
}

// ---------------------------------------------------------------- creation & payment

export async function createPendingOrder(input: {
  plan: string;
  email?: string | null;
  referredBy?: string | null;
  subscriptionId?: string | null;
  teamId?: string | null;
}): Promise<Order> {
  const db = await getDb();
  const [o] = await db
    .insert(orders)
    .values({
      token: randomToken(),
      plan: input.plan,
      email: input.email ?? null,
      referredBy: input.referredBy ?? null,
      subscriptionId: input.subscriptionId ?? null,
      teamId: input.teamId ?? null,
    })
    .returning();
  return o;
}

/**
 * Idempotently mark an order paid. Only the first caller transitions
 * pending_payment → awaiting_upload, so duplicate webhooks are harmless.
 */
export async function markOrderPaid(
  orderId: string,
  info: { email?: string | null; amountCents: number; sessionId?: string | null; paymentIntent?: string | null },
): Promise<Order | undefined> {
  const db = await getDb();
  const [current] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!current) return undefined;
  const plan = isPlanId(current.plan) ? PLANS[current.plan] : PLANS.starter;
  const [o] = await db
    .update(orders)
    .set({
      status: "awaiting_upload",
      email: info.email ?? current.email,
      amountCents: info.amountCents,
      stripeSessionId: info.sessionId ?? current.stripeSessionId,
      stripePaymentIntent: info.paymentIntent ?? null,
      redosRemaining: plan.redos,
      referralCode: current.referralCode ?? shortCode(),
      updatedAt: new Date(),
    })
    .where(and(eq(orders.id, orderId), eq(orders.status, "pending_payment")))
    .returning();
  if (!o) return undefined;
  if (o.referredBy) await creditReferrer(o.referredBy);
  if (o.email) await emails.orderPaid(o.email, o.token, plan.name);
  return o;
}

async function creditReferrer(code: string) {
  const db = await getDb();
  // Referrers earn 2 extra redos per paid referral.
  await db
    .update(orders)
    .set({ referralCount: sql`${orders.referralCount} + 1`, redosRemaining: sql`${orders.redosRemaining} + 2` })
    .where(eq(orders.referralCode, code));
}

export async function referralCodeExists(code: string): Promise<boolean> {
  const db = await getDb();
  const [o] = await db.select({ id: orders.id }).from(orders).where(eq(orders.referralCode, code)).limit(1);
  return !!o;
}

// ---------------------------------------------------------------- uploads

export async function listUploads(orderId: string) {
  const db = await getDb();
  return db.select().from(uploads).where(eq(uploads.orderId, orderId)).orderBy(uploads.createdAt);
}

export async function addUpload(order: Order, file: Blob): Promise<{ id: string; url: string }> {
  const db = await getDb();
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(uploads)
    .where(eq(uploads.orderId, order.id));
  if (count >= MAX_UPLOADS) throw new UserError(`You can upload up to ${MAX_UPLOADS} photos.`);
  const stored = await putFile(`uploads/${order.id}/selfie.jpg`, file, file.type || "image/jpeg");
  const [row] = await db.insert(uploads).values({ orderId: order.id, ...stored }).returning();
  return { id: row.id, url: row.url };
}

export async function removeUpload(order: Order, uploadId: string) {
  const db = await getDb();
  const [row] = await db
    .delete(uploads)
    .where(and(eq(uploads.id, uploadId), eq(uploads.orderId, order.id)))
    .returning();
  if (row) await deleteFiles([row]);
}

export class UserError extends Error {}

// ---------------------------------------------------------------- submit → training

export interface SubmitInput {
  subject: Subject;
  attire: Attire;
  backdropColor?: string;
  styles: string[];
}

function webhookUrl(kind: "train" | "gen", id: string): string {
  return appUrl(`/api/webhooks/fal?kind=${kind}&id=${id}&sig=${sign(`${kind}:${id}`)}`);
}

export async function submitOrder(order: Order, input: SubmitInput): Promise<void> {
  if (order.status !== "awaiting_upload") throw new UserError("This shoot has already been submitted.");
  const plan = isPlanId(order.plan) ? PLANS[order.plan] : PLANS.starter;
  const db = await getDb();

  let teamStyle: string | null = null;
  let backdrop = input.backdropColor;
  if (order.teamId) {
    const [team] = await db.select().from(teams).where(eq(teams.id, order.teamId)).limit(1);
    teamStyle = team?.teamStyle ?? null;
    backdrop = team?.backdropColor ?? backdrop;
  }
  const styles = resolveStyles(input.styles, plan.styleCount, teamStyle);
  if (styles.length === 0) throw new UserError("Pick at least one style.");

  const files = await listUploads(order.id);
  if (files.length < MIN_UPLOADS) throw new UserError(`Please upload at least ${MIN_UPLOADS} photos.`);

  // Claim the transition first so a double-click can't start two trainings.
  const [claimed] = await db
    .update(orders)
    .set({
      status: "training",
      subject: input.subject,
      attire: input.attire,
      backdropColor: backdrop ?? null,
      styles,
      trainingStartedAt: new Date(),
      error: null,
      updatedAt: new Date(),
    })
    .where(and(eq(orders.id, order.id), eq(orders.status, "awaiting_upload")))
    .returning();
  if (!claimed) throw new UserError("This shoot has already been submitted.");

  try {
    const entries = await Promise.all(
      files.map(async (f, i) => ({ name: `photo_${String(i + 1).padStart(2, "0")}.jpg`, data: await readFileBytes(f.url) })),
    );
    const zip = await putFile(`training/${order.id}/images.zip`, Buffer.from(makeZip(entries)), "application/zip");
    const requestId = await ai.submitTraining(zip.url, webhookUrl("train", order.id));
    await db
      .update(orders)
      .set({ trainingRequestId: requestId, trainingZip: zip, estCostCents: sql`${orders.estCostCents} + ${TRAIN_COST_CENTS}` })
      .where(eq(orders.id, order.id));
    if (isMockAi()) await handleTrainingResult(order.id, { requestId, ok: true, output: { diffusers_lora_file: { url: "mock://lora" } } });
  } catch (err) {
    await failOrder(order.id, `Training submit failed: ${String(err)}`);
    throw err;
  }
}

// ---------------------------------------------------------------- training done → generation

export async function handleTrainingResult(orderId: string, result: ai.FalWebhook): Promise<void> {
  const db = await getDb();
  if (!result.ok) {
    await failOrder(orderId, `Training failed: ${result.error}`);
    return;
  }
  const loraUrl = ai.extractLoraUrl(result.output);
  if (!loraUrl) {
    await failOrder(orderId, "Training returned no LoRA file");
    return;
  }
  const [order] = await db
    .update(orders)
    .set({ loraUrl, status: "generating", updatedAt: new Date() })
    .where(and(eq(orders.id, orderId), isNull(orders.loraUrl), eq(orders.status, "training")))
    .returning();
  if (!order) return; // duplicate webhook
  const plan = isPlanId(order.plan) ? PLANS[order.plan] : PLANS.starter;

  const planned: { style: string; numImages: number }[] = [];
  for (const style of order.styles) {
    let remaining = plan.photosPerStyle;
    while (remaining > 0) {
      const n = Math.min(remaining, ai.MAX_IMAGES_PER_REQUEST);
      planned.push({ style, numImages: n });
      remaining -= n;
    }
  }
  const created = await db
    .insert(jobs)
    .values(planned.map((p) => ({ orderId, ...p })))
    .returning();
  await submitJobs(order, created);
}

async function submitJobs(order: Order, list: Job[]): Promise<void> {
  const concurrency = 6;
  for (let i = 0; i < list.length; i += concurrency) {
    await Promise.all(list.slice(i, i + concurrency).map((job) => submitJob(order, job)));
  }
}

async function submitJob(order: Order, job: Job): Promise<void> {
  const db = await getDb();
  const style = getStyle(job.style);
  if (!style || !order.loraUrl) return;
  const prompt = buildPrompt(style, {
    subject: (order.subject as Subject) || "person",
    attire: (order.attire as Attire) || "style_default",
    backdropColor: order.backdropColor ?? undefined,
  });
  try {
    const requestId = await ai.submitGeneration({
      prompt,
      loraUrl: order.loraUrl,
      numImages: job.numImages,
      webhookUrl: webhookUrl("gen", job.id),
    });
    await db
      .update(jobs)
      .set({ requestId, status: "submitted", updatedAt: new Date() })
      .where(eq(jobs.id, job.id));
    if (isMockAi()) await handleGenerationResult(job.id, { requestId, ok: true, output: await mockImages(order, job) });
  } catch (err) {
    console.error("[pipeline] submit job failed", job.id, err);
    await db.update(jobs).set({ status: "failed", updatedAt: new Date() }).where(eq(jobs.id, job.id));
    await maybeFinishOrder(order.id);
  }
}

/** Mock provider: reuse the customer's own uploads as "generated" photos. */
async function mockImages(order: Order, job: Job) {
  const files = await listUploads(order.id);
  const images = Array.from({ length: job.numImages }, (_, i) => ({ url: files[i % Math.max(files.length, 1)]?.url }))
    .filter((i): i is { url: string } => !!i.url);
  return { images, has_nsfw_concepts: images.map(() => false) };
}

export async function handleGenerationResult(jobId: string, result: ai.FalWebhook): Promise<void> {
  const db = await getDb();
  // Claim the job (submitted → processing) so duplicate webhooks are ignored, but
  // only mark it done after its photos are saved; otherwise the order could be
  // marked complete while another job's photos are still being persisted.
  const staleProcessing = new Date(Date.now() - 10 * 60_000);
  const [job] = await db
    .update(jobs)
    .set({ status: "processing", updatedAt: new Date() })
    .where(
      and(
        eq(jobs.id, jobId),
        or(eq(jobs.status, "submitted"), and(eq(jobs.status, "processing"), lt(jobs.updatedAt, staleProcessing))),
      ),
    )
    .returning();
  if (!job) return; // duplicate or unknown
  if (result.ok) {
    const urls = ai.extractImages(result.output);
    const stored = await Promise.all(
      urls.map((u, i) => persistRemote(u, `photos/${job.orderId}/${job.style}-${i}.jpg`).catch(() => null)),
    );
    const rows = stored.filter((s): s is NonNullable<typeof s> => !!s);
    if (rows.length) {
      await db.insert(photos).values(rows.map((s) => ({ orderId: job.orderId, jobId: job.id, style: job.style, ...s })));
    }
    await db
      .update(orders)
      .set({ estCostCents: sql`${orders.estCostCents} + ${rows.length * IMAGE_COST_CENTS}` })
      .where(eq(orders.id, job.orderId));
  } else {
    console.error("[pipeline] generation failed", jobId, result.error);
  }
  await db.update(jobs).set({ status: result.ok ? "done" : "failed", updatedAt: new Date() }).where(eq(jobs.id, job.id));
  await maybeFinishOrder(job.orderId);
}

async function maybeFinishOrder(orderId: string): Promise<void> {
  const db = await getDb();
  const [{ pending }] = await db
    .select({ pending: sql<number>`count(*)::int` })
    .from(jobs)
    .where(and(eq(jobs.orderId, orderId), notInArray(jobs.status, ["done", "failed"])));
  if (pending > 0) return;
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(photos)
    .where(eq(photos.orderId, orderId));
  if (count === 0) {
    await failOrder(orderId, "No photos were generated");
    return;
  }
  const [order] = await db
    .update(orders)
    .set({ status: "completed", completedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(orders.id, orderId), eq(orders.status, "generating")))
    .returning();
  if (order?.email) await emails.photosReady(order.email, order.token, count);
}

async function failOrder(orderId: string, error: string) {
  const db = await getDb();
  const [order] = await db
    .update(orders)
    .set({ status: "failed", error, updatedAt: new Date() })
    .where(and(eq(orders.id, orderId), notInArray(orders.status, ["failed", "completed", "refunded"])))
    .returning();
  console.error("[pipeline] order failed", orderId, error);
  if (order?.email) await emails.generationFailed(order.email, order.token);
}

// ---------------------------------------------------------------- redo & retry

export async function redoStyle(order: Order, styleId: string): Promise<void> {
  if (order.status !== "completed") throw new UserError("Your shoot isn't finished yet.");
  if (!order.styles.includes(styleId)) throw new UserError("That style isn't part of your shoot.");
  const db = await getDb();
  const [updated] = await db
    .update(orders)
    .set({ redosRemaining: sql`${orders.redosRemaining} - 1`, updatedAt: new Date() })
    .where(and(eq(orders.id, order.id), sql`${orders.redosRemaining} > 0`))
    .returning();
  if (!updated) throw new UserError("You've used all your free redos.");
  const [job] = await db
    .insert(jobs)
    .values({ orderId: order.id, style: styleId, numImages: ai.MAX_IMAGES_PER_REQUEST, isRedo: true })
    .returning();
  // A redo on a completed order doesn't flip its status; it just adds photos.
  await submitJob(updated, job);
}

/** Admin: re-run a failed order from its last good step. */
export async function retryOrder(orderId: string): Promise<void> {
  const db = await getDb();
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order || order.status !== "failed") return;
  if (order.loraUrl) {
    const failed = await db
      .update(jobs)
      .set({ status: "queued", updatedAt: new Date() })
      .where(and(eq(jobs.orderId, orderId), eq(jobs.status, "failed")))
      .returning();
    const [o] = await db
      .update(orders)
      .set({ status: "generating", error: null, updatedAt: new Date() })
      .where(eq(orders.id, orderId))
      .returning();
    if (failed.length) await submitJobs(o, failed);
    else await maybeFinishOrder(orderId);
  } else {
    const [o] = await db
      .update(orders)
      .set({ status: "awaiting_upload", error: null, trainingRequestId: null, updatedAt: new Date() })
      .where(eq(orders.id, orderId))
      .returning();
    await submitOrder(o, {
      subject: (o.subject as Subject) || "person",
      attire: (o.attire as Attire) || "style_default",
      backdropColor: o.backdropColor ?? undefined,
      styles: o.styles,
    });
  }
}

// ---------------------------------------------------------------- polling fallback

/** Recover from missed webhooks by asking fal directly. Safe to call often. */
export async function syncOrder(order: Order): Promise<void> {
  if (isMockAi()) return;
  const db = await getDb();
  const staleBefore = new Date(Date.now() - 3 * 60_000);
  if (order.status === "training" && order.trainingRequestId && order.trainingStartedAt && order.trainingStartedAt < staleBefore) {
    const { env } = await import("./env");
    const res = await ai.fetchResult(env.falTrainer, order.trainingRequestId).catch(() => null);
    if (res) await handleTrainingResult(order.id, res);
  }
  if (order.status === "generating" || order.status === "completed") {
    const stale = await db
      .select()
      .from(jobs)
      .where(and(eq(jobs.orderId, order.id), inArray(jobs.status, ["submitted", "processing"]), lt(jobs.updatedAt, staleBefore)));
    for (const job of stale) {
      if (!job.requestId) continue;
      const res = await ai.fetchResult(ai.GEN_MODEL, job.requestId).catch(() => null);
      if (res) await handleGenerationResult(job.id, res);
    }
  }
}

export async function syncAllStale(): Promise<number> {
  const db = await getDb();
  const active = await db.select().from(orders).where(inArray(orders.status, ["training", "generating"]));
  for (const o of active) await syncOrder(o).catch((e) => console.error("[sync]", o.id, e));
  return active.length;
}

// ---------------------------------------------------------------- privacy

/** Delete customers' source selfies (and training zips) after N days. */
export async function purgeOldUploads(days = 7): Promise<number> {
  const db = await getDb();
  const cutoff = new Date(Date.now() - days * 86_400_000);
  const due = await db
    .select()
    .from(orders)
    .where(and(isNull(orders.uploadsPurgedAt), lt(orders.createdAt, cutoff)));
  for (const o of due) {
    const files: { url: string; pathname: string }[] = await db.delete(uploads).where(eq(uploads.orderId, o.id)).returning();
    if (o.trainingZip) files.push(o.trainingZip);
    await deleteFiles(files).catch((e) => console.error("[purge]", e));
    await db.update(orders).set({ uploadsPurgedAt: new Date() }).where(eq(orders.id, o.id));
  }
  // Photos uploaded to the free Just Listed tool follow the same 7-day rule.
  const freePhotos = await db
    .select()
    .from(leads)
    .where(and(lt(leads.createdAt, cutoff), sql`${leads.meta} ? 'photoPath'`));
  for (const l of freePhotos) {
    const { photoUrl, photoPath, ...rest } = l.meta;
    if (photoUrl && photoPath) await deleteFiles([{ url: photoUrl, pathname: photoPath }]).catch((e) => console.error("[purge]", e));
    await db.update(leads).set({ meta: rest }).where(eq(leads.id, l.id));
  }
  return due.length + freePhotos.length;
}

export async function orderPhotos(orderId: string) {
  const db = await getDb();
  return db.select().from(photos).where(eq(photos.orderId, orderId)).orderBy(photos.createdAt);
}

export async function orderJobsSummary(orderId: string) {
  const db = await getDb();
  const rows = await db.select({ status: jobs.status }).from(jobs).where(eq(jobs.orderId, orderId));
  const done = rows.filter((r) => r.status === "done" || r.status === "failed").length;
  return { total: rows.length, done };
}
