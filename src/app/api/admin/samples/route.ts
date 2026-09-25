import { revalidatePath } from "next/cache";
import { z } from "zod";
import { generateSamples } from "@/lib/samples";
import { handle, json } from "@/lib/http";
import { healthChecks } from "@/lib/health";

export const maxDuration = 300;

// Protected by src/proxy.ts (admin basic auth). Generates the style sample photos.
export const POST = handle(async (req: Request) => {
  const checks = await healthChecks();
  const missing = checks.filter((c) => !c.ok && ["Database (Neon)", "File storage (Blob)", "AI (fal.ai)"].includes(c.name));
  if (missing.length) return json({ error: `Set up first: ${missing.map((m) => m.name).join(", ")}. See the checklist above.` }, 503);
  const body = z.object({ styles: z.array(z.string().max(40)).max(20).optional() }).parse(await req.json().catch(() => ({})));
  const results = await generateSamples(body.styles);
  revalidatePath("/", "layout");
  return json({ results });
});
