import type { Metadata } from "next";
import { brand } from "@/lib/brand";

export const metadata: Metadata = { title: "Terms & Refunds" };

export default function Terms() {
  return (
    <div className="prose-simple mx-auto max-w-2xl px-4 py-14">
      <h1 className="font-display text-4xl font-semibold">Terms of Service & Refund Policy</h1>
      <p><em>Last updated: September 2026. Have this reviewed by a lawyer before launch.</em></p>
      <h2>Your photos</h2>
      <p>You may only upload photos of yourself, or of someone who has given you explicit permission. You confirm you have the rights to the photos you upload.</p>
      <h2>Your headshots</h2>
      <p>You own the headshots generated for you and may use them commercially, including on MLS, portals, signs, ads and business cards.</p>
      <h2>Acceptable use</h2>
      <p>No impersonation, no misleading use, and no content that violates law or the rules of your licensing authority. Graphics you publish are your responsibility. Check your brokerage and state advertising rules.</p>
      <h2>Refunds</h2>
      <p>AI results vary. Every plan includes free redos. If none of your headshots are usable, email {brand.supportEmail} within 14 days for a full refund. Brand Kit graphics and downloads remain available until refunded. Team seats that haven&apos;t been claimed can be refunded at any time.</p>
      <h2>Subscriptions</h2>
      <p>Always Fresh renews yearly until cancelled. Cancel any time by emailing us; you keep access until the end of the paid period.</p>
      <h2>Contact</h2>
      <p>{brand.supportEmail}</p>
    </div>
  );
}
