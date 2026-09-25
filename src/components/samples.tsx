import { existsSync } from "node:fs";
import path from "node:path";
import Image from "next/image";
import type { HeadshotStyle } from "@/lib/styles";

// Style preview card. Shows the AI-generated sample (admin → "Generate sample
// photos"), else a file in public/samples/<style-id>.jpg, else a scene gradient.
const GRADIENTS: Record<string, string> = {
  "studio-gray": "from-stone-300 to-stone-500",
  "bright-white": "from-white to-stone-200",
  "brand-backdrop": "from-[#1f2a44] to-[#2c3b5e]",
  "modern-office": "from-sky-100 to-slate-300",
  "front-porch": "from-amber-200 to-orange-300",
  "luxury-interior": "from-stone-200 to-amber-100",
  downtown: "from-slate-300 to-orange-200",
  neighborhood: "from-lime-100 to-emerald-200",
  "open-house": "from-amber-50 to-stone-200",
  "outdoor-greenery": "from-emerald-200 to-green-400",
  coastal: "from-sky-200 to-amber-100",
  "black-white": "from-neutral-300 to-neutral-700",
};

function hasSample(id: string) {
  return existsSync(path.join(process.cwd(), "public", "samples", `${id}.jpg`));
}

export function StyleCard({ style, src }: { style: HeadshotStyle; src?: string }) {
  const image = src ?? (hasSample(style.id) ? `/samples/${style.id}.jpg` : null);
  return (
    <figure>
      <div className={`relative aspect-[4/5] overflow-hidden rounded-2xl bg-gradient-to-b ${GRADIENTS[style.id] ?? "from-stone-200 to-stone-400"}`}>
        {image ? (
          <Image src={image} alt={`${style.name} style example: AI-generated photo of a fictional agent`} fill unoptimized={!image.startsWith("https://")} className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
        ) : null}
      </div>
      <figcaption className="mt-3">
        <span className="text-sm font-semibold">{style.name}</span>
        {style.mlsSafe ? <span className="ml-2 text-xs font-medium text-accent">MLS-safe</span> : null}
        <span className="block text-xs text-muted">{style.description}</span>
      </figcaption>
    </figure>
  );
}
