import { describe, expect, it } from "vitest";
import { unzipSync } from "fflate";
import { STYLES, TRIGGER, buildPrompt, getStyle, resolveStyles } from "@/lib/styles";
import { PLANS, formatUsd, isPlanId } from "@/lib/plans";
import { isToken, randomToken, shortCode, sign, verify } from "@/lib/tokens";
import { makeZip } from "@/lib/zip";
import { extractImages, extractLoraUrl, parseFalWebhook } from "@/lib/ai";

describe("styles", () => {
  it("builds a prompt with the trigger, subject, attire and backdrop color", () => {
    const p = buildPrompt(getStyle("brand-backdrop")!, { subject: "woman", attire: "business_casual", backdropColor: "teal" });
    expect(p).toContain(`${TRIGGER} woman`);
    expect(p).toContain("muted teal");
    expect(p).toContain("blazer");
    expect(p).not.toContain("{color}");
  });

  it("gives Pro every style and caps Starter at its style count", () => {
    expect(resolveStyles([], PLANS.pro.styleCount)).toHaveLength(STYLES.length);
    expect(resolveStyles(["coastal", "downtown", "open-house", "black-white", "neighborhood"], 4)).toEqual([
      "coastal",
      "downtown",
      "open-house",
      "black-white",
    ]);
  });

  it("drops unknown and duplicate styles", () => {
    expect(resolveStyles(["coastal", "coastal", "nope"], 4)).toEqual(["coastal"]);
  });

  it("always includes the team style first for team orders", () => {
    expect(resolveStyles(["coastal"], 4, "brand-backdrop")).toEqual(["brand-backdrop", "coastal"]);
    expect(resolveStyles(["a", "b", "c", "d"].map(() => "coastal"), 1, "studio-gray")).toEqual(["studio-gray"]);
  });
});

describe("plans", () => {
  it("formats prices", () => {
    expect(formatUsd(2900)).toBe("$29");
    expect(formatUsd(3950)).toBe("$39.50");
  });
  it("validates plan ids", () => {
    expect(isPlanId("pro")).toBe(true);
    expect(isPlanId("enterprise")).toBe(false);
  });
});

describe("tokens", () => {
  it("generates valid unguessable tokens and short codes", () => {
    const t = randomToken();
    expect(isToken(t)).toBe(true);
    expect(randomToken()).not.toBe(t);
    expect(shortCode(8)).toMatch(/^[A-HJ-NP-Z2-9]{8}$/);
    expect(isToken("../../etc")).toBe(false);
  });
  it("signs and verifies, rejecting tampering", () => {
    const s = sign("gen:123");
    expect(verify("gen:123", s)).toBe(true);
    expect(verify("gen:124", s)).toBe(false);
    expect(verify("gen:123", null)).toBe(false);
    expect(verify("gen:123", "short")).toBe(false);
  });
});

describe("zip", () => {
  it("stores files and de-duplicates names", () => {
    const zip = makeZip([
      { name: "a.jpg", data: new Uint8Array([1]) },
      { name: "a.jpg", data: new Uint8Array([2]) },
    ]);
    const out = unzipSync(zip);
    expect(Object.keys(out).sort()).toEqual(["a-1.jpg", "a.jpg"]);
  });
});

describe("fal webhook parsing", () => {
  it("parses success payloads and filters NSFW-flagged images", () => {
    const w = parseFalWebhook({
      request_id: "r1",
      status: "OK",
      payload: { images: [{ url: "https://x/1.jpg" }, { url: "https://x/2.jpg" }], has_nsfw_concepts: [false, true] },
    });
    expect(w?.ok).toBe(true);
    expect(extractImages(w?.output)).toEqual(["https://x/1.jpg"]);
  });
  it("parses errors and training output", () => {
    const w = parseFalWebhook({ request_id: "r2", status: "ERROR", error: "boom" });
    expect(w).toMatchObject({ ok: false, error: "boom" });
    expect(extractLoraUrl({ diffusers_lora_file: { url: "https://x/lora.safetensors" } })).toBe("https://x/lora.safetensors");
    expect(parseFalWebhook({})).toBeNull();
  });
});
