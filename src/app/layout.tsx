import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { brand, appUrl } from "@/lib/brand";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { RefCapture } from "@/components/ref-capture";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(appUrl()),
  title: {
    default: `${brand.name}: AI Realtor Headshots & Brand Kit in 1 Hour`,
    template: `%s | ${brand.name}`,
  },
  description:
    "Studio-quality AI headshots made for real estate agents, plus ready-to-post Just Listed, Open House and Sold graphics. From $29. No photographer, no scheduling.",
  openGraph: { siteName: brand.name, type: "website" },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <a href="#main" className="sr-only rounded-lg bg-accent px-4 py-2 text-on-accent focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50">
          Skip to content
        </a>
        <RefCapture />
        <SiteHeader />
        <main id="main" className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
