"use client";
import { useEffect } from "react";

/** Remember ?ref=CODE for 30 days so referral discounts survive browsing. */
export function RefCapture() {
  useEffect(() => {
    try {
      const ref = new URLSearchParams(window.location.search).get("ref");
      if (ref && /^[A-Z0-9]{4,12}$/i.test(ref)) {
        localStorage.setItem("ref", JSON.stringify({ code: ref.toUpperCase(), at: Date.now() }));
      }
    } catch {}
  }, []);
  return null;
}

export function readRef(): string | undefined {
  try {
    const raw = localStorage.getItem("ref");
    if (!raw) return undefined;
    const { code, at } = JSON.parse(raw);
    return Date.now() - at < 30 * 86_400_000 ? code : undefined;
  } catch {
    return undefined;
  }
}
