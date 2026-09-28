// Print sizes for the Brand Kit (shared by the renderer and the studio UI).

export const PRINT_DPI = 300;
export const BLEED_IN = 0.125;

export type PrintNeed = "address" | "price" | "details" | "date" | "headline";

export interface PrintFormat {
  id: string;
  name: string;
  size: string; // human label, e.g. '3.5 × 2 in'
  widthIn: number; // trim size
  heightIn: number;
  needs: PrintNeed[];
  /** Largest printed photo edge in inches: decides whether the headshot is upscaled first. */
  photoIn: number;
  hint: string;
}

export const PRINT_FORMATS: PrintFormat[] = [
  { id: "business-card", name: "Business card", size: "3.5 × 2 in", widthIn: 3.5, heightIn: 2, needs: [], photoIn: 1, hint: "Standard US business card." },
  { id: "postcard", name: "Postcard", size: "9 × 6 in", widthIn: 9, heightIn: 6, needs: ["headline", "address", "price", "details", "date"], photoIn: 2.2, hint: "Just Listed / Just Sold mailers. Front side; the printer adds the mailing side." },
  { id: "flyer", name: "Flyer", size: "8.5 × 11 in", widthIn: 8.5, heightIn: 11, needs: ["headline", "address", "price", "details", "date"], photoIn: 3.2, hint: "Listing and open house flyers, prints on letter paper." },
  { id: "sign-rider", name: "Sign rider", size: "24 × 6 in", widthIn: 24, heightIn: 6, needs: [], photoIn: 4.4, hint: "Hangs under your yard sign. Phone number sized to read from the street." },
  { id: "headshot-5x7", name: "Headshot print", size: "5 × 7 in", widthIn: 5, heightIn: 7, needs: [], photoIn: 7, hint: "Your headshot alone, for a desk frame or listing binder." },
  { id: "headshot-8x10", name: "Headshot print", size: "8 × 10 in", widthIn: 8, heightIn: 10, needs: [], photoIn: 10, hint: "Your headshot alone, for the office wall or a frame." },
];

export const HEADLINES = ["JUST LISTED", "JUST SOLD", "OPEN HOUSE", "COMING SOON", "UNDER CONTRACT", "PRICE IMPROVED"];

export function getPrintFormat(id: string) {
  return PRINT_FORMATS.find((f) => f.id === id);
}

/** Headshots are about 768 px on the short edge; anything printed larger than ~2.9 in at 300 DPI gets the 4x upscale. */
export function needsUpscale(f: PrintFormat) {
  return f.photoIn * PRINT_DPI > 768 * 1.15;
}

