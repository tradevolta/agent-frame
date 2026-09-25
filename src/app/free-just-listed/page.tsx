import type { Metadata } from "next";
import { FreeTool } from "./free-tool";

export const metadata: Metadata = {
  title: "Free Just Listed Graphic Maker for Realtors",
  description: "Make a ready-to-post Just Listed graphic with your photo, name and brokerage in 30 seconds. Free, no design skills needed.",
};

export default function FreeJustListed() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold text-accent">Free tool</p>
        <h1 className="mt-2 font-display text-4xl md:text-5xl leading-tight">Free Just Listed graphic maker</h1>
        <p className="mt-3 text-lg text-muted">Add your photo and listing details and get an Instagram-ready graphic with your brokerage name included. Takes 30 seconds.</p>
      </div>
      <FreeTool />
    </div>
  );
}
