// Realtor-specific headshot styles. Prompts are tuned for realism ("natural
// mode"): clients meet agents in person, so the photo must look like them.

export type Subject = "woman" | "man" | "person";
export type Attire = "formal" | "business_casual" | "style_default";

export interface HeadshotStyle {
  id: string;
  name: string;
  description: string;
  scene: string;
  attire: { formal: string; business_casual: string };
  mlsSafe?: boolean; // plain background most brokerages / MLS accept
}

export const STYLES: HeadshotStyle[] = [
  {
    id: "studio-gray",
    name: "Classic Studio",
    description: "Neutral gray backdrop. The MLS-safe classic.",
    scene: "seamless neutral gray studio backdrop, soft three-point studio lighting",
    attire: { formal: "wearing a tailored navy suit", business_casual: "wearing a crisp blazer over a simple top" },
    mlsSafe: true,
  },
  {
    id: "bright-white",
    name: "Bright White",
    description: "Clean white background most brokerages require.",
    scene: "pure white background, bright even high-key lighting",
    attire: { formal: "wearing a charcoal suit", business_casual: "wearing a light blazer" },
    mlsSafe: true,
  },
  {
    id: "brand-backdrop",
    name: "Brand Color",
    description: "Solid backdrop in your brand color.",
    scene: "solid {color} studio backdrop, soft flattering light",
    attire: { formal: "wearing a dark suit", business_casual: "wearing a neat blazer" },
    mlsSafe: true,
  },
  {
    id: "modern-office",
    name: "Modern Brokerage",
    description: "Bright, modern real estate office behind you.",
    scene: "bright modern real estate office interior softly blurred in the background, large windows",
    attire: { formal: "wearing a fitted suit", business_casual: "wearing smart business casual clothing" },
  },
  {
    id: "front-porch",
    name: "Front Porch",
    description: "Welcoming craftsman home at golden hour.",
    scene: "standing in front of a welcoming craftsman style home with a front porch, golden hour sunlight, background softly blurred",
    attire: { formal: "wearing a blazer", business_casual: "wearing a smart casual sweater" },
  },
  {
    id: "luxury-interior",
    name: "Luxury Listing",
    description: "Elegant high-end home interior.",
    scene: "elegant luxury home interior with marble kitchen softly blurred behind, warm natural light",
    attire: { formal: "wearing an elegant dark suit", business_casual: "wearing a refined blazer" },
  },
  {
    id: "downtown",
    name: "Downtown",
    description: "City streetscape for urban agents.",
    scene: "downtown city street with brick buildings softly blurred, overcast flattering daylight",
    attire: { formal: "wearing a modern suit", business_casual: "wearing a stylish jacket" },
  },
  {
    id: "neighborhood",
    name: "Neighborhood",
    description: "Tree-lined suburban street.",
    scene: "sunny tree-lined suburban neighborhood street, houses softly blurred in the background",
    attire: { formal: "wearing a blazer", business_casual: "wearing a polo or casual button-up" },
  },
  {
    id: "open-house",
    name: "Open House",
    description: "Bright entryway of a staged home.",
    scene: "bright entryway of a beautifully staged home, open door light, background softly blurred",
    attire: { formal: "wearing a sharp suit", business_casual: "wearing smart business casual clothing" },
  },
  {
    id: "outdoor-greenery",
    name: "Park Greenery",
    description: "Soft green bokeh, approachable and warm.",
    scene: "outdoors with lush green trees softly blurred in the background, soft natural light",
    attire: { formal: "wearing a blazer", business_casual: "wearing a casual button-up" },
  },
  {
    id: "coastal",
    name: "Coastal",
    description: "Beach-house deck — great for coastal markets.",
    scene: "on the deck of a coastal beach house, ocean and dunes softly blurred, bright airy light",
    attire: { formal: "wearing a light linen blazer", business_casual: "wearing a light linen shirt" },
  },
  {
    id: "black-white",
    name: "Black & White",
    description: "Timeless monochrome portrait.",
    scene: "classic black and white studio portrait, dramatic soft window light, monochrome",
    attire: { formal: "wearing a dark suit", business_casual: "wearing a simple dark sweater" },
  },
];

export const BACKDROP_COLORS: Record<string, { label: string; prompt: string; hex: string }> = {
  navy: { label: "Navy", prompt: "deep navy blue", hex: "#1f2a44" },
  burgundy: { label: "Burgundy", prompt: "rich burgundy", hex: "#6b1f2e" },
  teal: { label: "Teal", prompt: "muted teal", hex: "#1f5f5b" },
  forest: { label: "Forest green", prompt: "deep forest green", hex: "#23422f" },
  charcoal: { label: "Charcoal", prompt: "charcoal gray", hex: "#33363b" },
  tan: { label: "Warm tan", prompt: "warm tan beige", hex: "#b89b78" },
};

export const TRIGGER = "AGNTFRM";

export function getStyle(id: string): HeadshotStyle | undefined {
  return STYLES.find((s) => s.id === id);
}

export interface PromptOptions {
  subject: Subject;
  attire: Attire;
  backdropColor?: string;
}

export function buildPrompt(style: HeadshotStyle, opts: PromptOptions): string {
  const attire =
    opts.attire === "style_default" ? style.attire.formal : style.attire[opts.attire];
  const color = BACKDROP_COLORS[opts.backdropColor || "navy"] ?? BACKDROP_COLORS.navy;
  const scene = style.scene.replace("{color}", color.prompt);
  return [
    `professional real estate agent headshot photo of ${TRIGGER} ${opts.subject}`,
    attire,
    scene,
    "head and shoulders framing, warm confident approachable smile, looking at camera",
    "photorealistic, natural skin texture, true-to-life facial features, sharp focus on eyes",
    "shot on 85mm lens, shallow depth of field, professional color grading",
  ].join(", ");
}

/** Which styles an order gets: Pro/Team get everything, Starter picks N. */
export function resolveStyles(selected: string[], styleCount: number, teamStyle?: string | null): string[] {
  const valid = selected.filter((id) => getStyle(id));
  let result: string[];
  if (styleCount >= STYLES.length) result = STYLES.map((s) => s.id);
  else result = Array.from(new Set(valid)).slice(0, styleCount);
  if (teamStyle && getStyle(teamStyle) && !result.includes(teamStyle)) {
    result = [teamStyle, ...result].slice(0, Math.max(styleCount, 1));
  }
  return result;
}
