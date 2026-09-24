import { existsSync } from "node:fs";
import path from "node:path";
import Image from "next/image";
import type { HeadshotStyle } from "@/lib/styles";

// Style preview card. Drop real sample outputs in public/samples/<style-id>.jpg
// and they replace the illustrated placeholder automatically.
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

export function StyleCard({ style }: { style: HeadshotStyle }) {
  const sample = hasSample(style.id);
  return (
    <div className="card overflow-hidden">
      <div className={`relative aspect-[4/5] bg-gradient-to-b ${GRADIENTS[style.id] ?? "from-stone-200 to-stone-400"}`}>
        {sample ? (
          <Image src={`/samples/${style.id}.jpg`} alt={`${style.name} realtor headshot example`} fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
        ) : (
          <svg viewBox="0 0 100 125" className="absolute inset-x-0 bottom-0 mx-auto h-[85%] opacity-80" aria-hidden>
            <circle cx="50" cy="45" r="20" fill="#1f2a44" opacity="0.55" />
            <path d="M12 125c2-27 18-42 38-42s36 15 38 42z" fill="#1f2a44" opacity="0.65" />
          </svg>
        )}
        {style.mlsSafe ? (
          <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-medium text-navy">MLS-safe</span>
        ) : null}
      </div>
      <div className="p-3">
        <div className="text-sm font-semibold">{style.name}</div>
        <div className="text-xs text-muted">{style.description}</div>
      </div>
    </div>
  );
}
