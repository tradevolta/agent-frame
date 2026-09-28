import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";

// Inter (SIL OFL) in real weights for next/og images; its built-in font has no bold.
// The files are bundled via outputFileTracingIncludes in next.config.ts.
const fontDir = path.join(process.cwd(), "assets", "fonts");
let fonts: Promise<{ name: string; data: Buffer; weight: 400 | 700 | 800; style: "normal" }[]> | null = null;

export function ogFonts() {
  fonts ??= Promise.all(
    ([400, 700, 800] as const).map(async (weight) => ({
      name: "Inter",
      data: await readFile(path.join(fontDir, `inter-latin-${weight}-normal.woff`)),
      weight,
      style: "normal" as const,
    })),
  );
  return fonts;
}
