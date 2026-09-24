import type { Metadata } from "next";
import { Geist, Fraunces } from "next/font/google";
import "./globals.css";
import { brand, appUrl } from "@/lib/brand";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { RefCapture } from "@/components/ref-capture";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(appUrl()),
  title: {
    default: `${brand.name} — AI Realtor Headshots & Brand Kit in 1 Hour`,
    template: `%s | ${brand.name}`,
  },
  description:
    "Studio-quality AI headshots made for real estate agents, plus ready-to-post Just Listed, Open House and Sold graphics. From $29. No photographer, no scheduling.",
  openGraph: { siteName: brand.name, type: "website" },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geist.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <RefCapture />
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
