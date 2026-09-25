import "server-only";
import { like } from "drizzle-orm";
import { getDb } from "./db";
import { siteAssets } from "./db/schema";
import { env, isMockAi } from "./env";
import { extractImages } from "./ai";
import { persistRemote } from "./storage";
import { STYLES, buildSamplePrompt, getStyle } from "./styles";
import { UserError } from "./pipeline";

// Marketing sample photos: one AI-generated FICTIONAL agent per style, made on
// the server with fal.ai (the same FLUX family customers' shoots use). The site
// labels them as AI-generated examples, never as customer results.

const SAMPLE_MODEL = "fal-ai/flux-pro/v1.1-ultra";

const PEOPLE: Record<string, string> = {
  "studio-gray": "a Black woman in her early 40s with shoulder-length natural curls",
  "bright-white": "a white man in his 50s with short salt-and-pepper hair",
  "brand-backdrop": "a South Asian woman in her 30s with long dark hair",
  "modern-office": "a Latino man in his late 30s with a short beard",
  "front-porch": "a white woman in her 60s with a silver bob",
  "luxury-interior": "an East Asian man in his 40s with neatly styled hair",
  downtown: "a Black man in his early 30s with a close fade haircut",
  neighborhood: "a white woman in her late 20s with a blonde ponytail",
  "open-house": "a Latina woman in her 40s with wavy brown hair",
  "outdoor-greenery": "a Middle Eastern man in his 50s with a trimmed gray beard",
  coastal: "a white man in his 40s with sandy brown hair",
  "black-white": "a Black woman in her 50s with short gray natural hair",
};

export type SampleMap = Record<string, string>;

/** Style id → sample photo URL. Never throws: marketing pages fall back to gradients. */
export async function getSampleUrls(): Promise<SampleMap> {
  try {
    const db = await getDb();
    const rows = await db.select().from(siteAssets).where(like(siteAssets.key, "sample:%"));
    return Object.fromEntries(rows.map((r) => [r.key.slice("sample:".length), r.url]));
  } catch {
    return {};
  }
}

async function generateOne(styleId: string): Promise<string> {
  const style = getStyle(styleId)!;
  const { fal } = await import("@fal-ai/client");
  fal.config({ credentials: env.falKey });
  const result = await fal.subscribe(SAMPLE_MODEL, {
    input: {
      prompt: buildSamplePrompt(style, PEOPLE[styleId] ?? "a real estate agent"),
      aspect_ratio: "3:4",
      raw: true, // less "AI glossy", more like a real photo
      num_images: 1,
      output_format: "jpeg",
      safety_tolerance: "2",
    },
  });
  const [url] = extractImages(result.data);
  if (!url) throw new Error(`No image returned for ${styleId}`);
  const stored = await persistRemote(url, `samples/${styleId}.jpg`);
  const db = await getDb();
  await db
    .insert(siteAssets)
    .values({ key: `sample:${styleId}`, ...stored })
    .onConflictDoUpdate({ target: siteAssets.key, set: { url: stored.url, pathname: stored.pathname, updatedAt: new Date() } });
  return stored.url;
}

/** Generate (or regenerate) samples. Returns per-style results. */
export async function generateSamples(styleIds: string[] = STYLES.map((s) => s.id)) {
  if (isMockAi()) throw new UserError("Set FAL_KEY in Vercel first. Sample photos are generated with fal.ai.");
  const results = await Promise.allSettled(styleIds.map((id) => generateOne(id)));
  return styleIds.map((id, i) => {
    const r = results[i];
    return r.status === "fulfilled" ? { style: id, ok: true } : { style: id, ok: false, error: String(r.reason).slice(0, 200) };
  });
}
