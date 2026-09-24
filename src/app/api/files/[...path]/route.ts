import { readFile } from "node:fs/promises";
import path from "node:path";
import { LOCAL_ROOT } from "@/lib/storage";
import { isMockStorage } from "@/lib/env";

const TYPES: Record<string, string> = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".zip": "application/zip" };

// Serves local mock storage in development. Production uses Vercel Blob URLs.
export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  if (!isMockStorage()) return new Response("Not found", { status: 404 });
  const rel = (await params).path.join("/");
  const full = path.resolve(LOCAL_ROOT, rel);
  if (!full.startsWith(LOCAL_ROOT + path.sep)) return new Response("Not found", { status: 404 });
  try {
    const data = await readFile(full);
    return new Response(data, { headers: { "Content-Type": TYPES[path.extname(full).toLowerCase()] ?? "application/octet-stream" } });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
