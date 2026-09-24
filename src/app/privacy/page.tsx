import type { Metadata } from "next";
import { brand } from "@/lib/brand";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function Privacy() {
  return (
    <div className="prose-simple mx-auto max-w-2xl px-4 py-14">
      <h1 className="font-display text-4xl font-semibold">Privacy Policy</h1>
      <p><em>Last updated: September 2026. Have this reviewed by a lawyer before launch.</em></p>
      <h2>What we collect</h2>
      <ul>
        <li>Your email address and payment confirmation (card details are handled by Stripe and never touch our servers).</li>
        <li>The photos you upload, the headshots we generate, and details you enter for your Brand Kit.</li>
        <li>Basic usage analytics to improve the product.</li>
      </ul>
      <h2>How we use your photos</h2>
      <p>Your uploaded photos are used only to create a private AI model of your likeness and generate your headshots. We do not use your photos to train models for anyone else, and we never sell your data.</p>
      <h2>Retention</h2>
      <ul>
        <li>Uploaded selfies and training files are deleted automatically 7 days after your order.</li>
        <li>Generated headshots stay available in your studio so you can download them. Email {brand.supportEmail} and we&apos;ll delete everything within 7 days.</li>
      </ul>
      <h2>Processors</h2>
      <p>We use trusted providers to run the service: Vercel (hosting & storage), Stripe (payments), fal.ai (AI processing), Neon (database) and Zoho (email).</p>
      <h2>Contact</h2>
      <p>{brand.supportEmail}</p>
    </div>
  );
}
