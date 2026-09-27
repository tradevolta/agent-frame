import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

// Embedded Postgres in a fresh temp dir; mock AI and storage (no keys set).
vi.hoisted(() => {
  process.env.PGLITE_DIR = `${process.env.TMPDIR || "/tmp"}/af-queue-${Date.now()}`;
  delete process.env.DATABASE_URL;
  delete process.env.POSTGRES_URL;
  delete process.env.FAL_KEY;
  delete process.env.BLOB_READ_WRITE_TOKEN;
});

const fal = vi.hoisted(() => ({ training: [] as unknown[], generation: [] as unknown[] }));

// Each queued entry is either an error to throw or undefined (succeed like the mock).
vi.mock("@/lib/ai", async (orig) => {
  const real = await orig<typeof import("@/lib/ai")>();
  return {
    ...real,
    submitTraining: vi.fn(async (...args: Parameters<typeof real.submitTraining>) => {
      const next = fal.training.shift();
      if (next) throw next;
      return real.submitTraining(...args);
    }),
    submitGeneration: vi.fn(async (...args: Parameters<typeof real.submitGeneration>) => {
      const next = fal.generation.shift();
      if (next) throw next;
      return real.submitGeneration(...args);
    }),
  };
});

import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { jobs, orders } from "@/lib/db/schema";
import {
  addUpload,
  createPendingOrder,
  getOrderByToken,
  markOrderPaid,
  orderJobsSummary,
  processQueue,
  queueSummary,
  retryOrder,
  submitOrder,
} from "@/lib/pipeline";

const locked = Object.assign(new Error("Forbidden"), { status: 403, body: { detail: "User is locked. Reason: Exhausted balance." } });
const rateLimited = Object.assign(new Error("Too Many Requests"), { status: 429 });
const invalid = Object.assign(new Error("Unprocessable"), { status: 422, body: { detail: "bad input" } });

async function paidOrderWithUploads() {
  const pending = await createPendingOrder({ plan: "starter", email: "agent@example.com" });
  await markOrderPaid(pending.id, { amountCents: 2900, email: "agent@example.com" });
  const order = (await getOrderByToken(pending.token))!;
  for (let i = 0; i < 8; i++) await addUpload(order, new Blob([new Uint8Array([0xff, 0xd8, i])], { type: "image/jpeg" }));
  return order;
}

const submitInput = { subject: "woman" as const, attire: "style_default" as const, styles: ["studio-gray", "coastal", "downtown", "black-white"] };

async function reload(id: string) {
  const db = await getDb();
  const [o] = await db.select().from(orders).where(eq(orders.id, id));
  return o;
}

beforeAll(async () => {
  await getDb();
}, 60_000);

beforeEach(() => {
  fal.training.length = 0;
  fal.generation.length = 0;
});

describe("retry queue", () => {
  it("queues an order when fal.ai refuses training, then finishes it on retry", async () => {
    const order = await paidOrderWithUploads();
    fal.training.push(locked);

    await expect(submitOrder(order, submitInput)).resolves.toBeUndefined(); // customer sees no error
    let o = await reload(order.id);
    expect(o.status).toBe("queued");
    expect(o.attempts).toBe(1);
    expect(o.error).toMatch(/Exhausted balance/);
    expect(o.trainingZip).toBeTruthy(); // selfies zipped once, reused on retry
    expect(+o.nextAttemptAt! - Date.now()).toBeGreaterThan(60_000);

    // Not due yet: nothing happens.
    expect(await processQueue()).toEqual({ orders: 0, jobs: 0 });
    expect((await queueSummary()).queuedOrders).toBeGreaterThanOrEqual(1);

    // Time passes: the retry is due. One photo batch hits a rate limit on the way.
    const db = await getDb();
    await db.update(orders).set({ nextAttemptAt: new Date(Date.now() - 1000) }).where(eq(orders.id, order.id));
    fal.generation.push(rateLimited);
    const run = await processQueue({ orderId: order.id });
    expect(run.orders).toBe(1);
    o = await reload(order.id);
    expect(o.status).toBe("generating"); // the rate-limited batch waits its turn
    expect((await orderJobsSummary(order.id)).waiting).toBe(1);

    await processQueue({ orderId: order.id, force: true });
    o = await reload(order.id);
    expect(o.status).toBe("completed");
    const rows = await db.select().from(jobs).where(eq(jobs.orderId, order.id));
    expect(rows.every((j) => j.status === "done")).toBe(true);
  }, 60_000);

  it("fails right away on a non-retryable error, and admin retry recovers it", async () => {
    const order = await paidOrderWithUploads();
    fal.training.push(invalid);
    await expect(submitOrder(order, submitInput)).rejects.toThrow(/couldn't start/);
    expect((await reload(order.id)).status).toBe("failed");

    await retryOrder(order.id);
    const o = await reload(order.id);
    expect(o.status).toBe("completed");
    expect(o.attempts).toBe(0);
  }, 60_000);

  it("admin retry re-runs failed photo batches on a completed order", async () => {
    const order = await paidOrderWithUploads();
    // Every batch submit fails with a non-retryable error except the first.
    fal.generation.push(undefined, invalid, invalid, invalid);
    await submitOrder(order, submitInput);
    const db = await getDb();
    let rows = await db.select().from(jobs).where(eq(jobs.orderId, order.id));
    expect(rows.filter((j) => j.status === "failed").length).toBe(3);
    expect((await reload(order.id)).status).toBe("completed");

    await retryOrder(order.id);
    rows = await db.select().from(jobs).where(eq(jobs.orderId, order.id));
    expect(rows.every((j) => j.status === "done")).toBe(true);
  }, 60_000);
});

