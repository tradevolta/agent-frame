import "server-only";
import { mkdir, writeFile, rm } from "node:fs/promises";
import path from "node:path";
import { appUrl } from "./brand";
import { isMockStorage } from "./env";
import { randomToken } from "./tokens";

// Vercel Blob in production; local disk (served by /api/files) in dev.
export const LOCAL_ROOT = path.join(process.cwd(), ".data", "files");

export interface Stored {
  url: string;
  pathname: string;
}

export async function putFile(pathname: string, body: Buffer | Blob | ArrayBuffer, contentType: string): Promise<Stored> {
  if (isMockStorage()) {
    const ext = path.extname(pathname);
    const unique = `${pathname.slice(0, pathname.length - ext.length)}-${randomToken(6)}${ext}`;
    const full = path.join(LOCAL_ROOT, unique);
    await mkdir(path.dirname(full), { recursive: true });
    const buf = body instanceof Blob ? Buffer.from(await body.arrayBuffer()) : Buffer.from(body as ArrayBuffer);
    await writeFile(full, buf);
    return { url: appUrl(`/api/files/${unique}`), pathname: unique };
  }
  const { put } = await import("@vercel/blob");
  const res = await put(pathname, body as Blob, { access: "public", contentType, addRandomSuffix: true });
  return { url: res.url, pathname: res.pathname };
}

export async function deleteFiles(items: Stored[]): Promise<void> {
  if (items.length === 0) return;
  if (isMockStorage()) {
    await Promise.all(items.map((i) => rm(path.join(LOCAL_ROOT, i.pathname), { force: true })));
    return;
  }
  const { del } = await import("@vercel/blob");
  await del(items.map((i) => i.url));
}

/** Copy a remote file (e.g. an expiring fal.ai output URL) into our storage. */
export async function persistRemote(url: string, pathname: string): Promise<Stored> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const type = res.headers.get("content-type") || "image/jpeg";
  return putFile(pathname, Buffer.from(await res.arrayBuffer()), type);
}

export async function readFileBytes(url: string): Promise<Uint8Array> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return new Uint8Array(await res.arrayBuffer());
}
