import { healthChecks, regionInfo } from "@/lib/health";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Public, secret-free status for troubleshooting: which services are connected.
// Error text is trimmed and hostnames/credentials are masked.
const mask = (s: string) =>
  s
    .replace(/[a-z0-9.-]+\.(supabase\.com|supabase\.co|neon\.tech|vercel-storage\.com)(:\d+)?/gi, "<host>")
    .replace(/postgres(ql)?:\/\/[^\s|]+/gi, "<url>")
    .slice(0, 300);

export async function GET() {
  const started = Date.now();
  try {
    const checks = await healthChecks();
    return Response.json(
      {
        ok: checks.every((c) => c.ok),
        ms: Date.now() - started,
        checks: checks.map((c) => ({ name: c.name, ok: c.ok, detail: c.ok ? (c.name === "Database" || c.name.startsWith("Payments") ? mask(c.detail) : "ok") : mask(c.detail) })),
        adminPasswordSet: !!process.env.ADMIN_PASSWORD,
        regions: regionInfo(),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    return Response.json({ ok: false, ms: Date.now() - started, error: mask(String((err as Error)?.message ?? err)) }, { status: 500 });
  }
}
