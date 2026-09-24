import { zipSync } from "fflate";

export interface ZipEntry {
  name: string;
  data: Uint8Array;
}

/** Images are already compressed, so store them (level 0) for speed. */
export function makeZip(entries: ZipEntry[]): Uint8Array {
  const files: Record<string, [Uint8Array, { level: 0 }]> = {};
  const seen = new Map<string, number>();
  for (const e of entries) {
    const n = seen.get(e.name) ?? 0;
    seen.set(e.name, n + 1);
    const name = n === 0 ? e.name : e.name.replace(/(\.[^.]+)?$/, `-${n}$1`);
    files[name] = [e.data, { level: 0 }];
  }
  return zipSync(files);
}
