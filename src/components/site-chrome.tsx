import Link from "next/link";
import { FrameCorners } from "@phosphor-icons/react/dist/ssr";
import { brand } from "@/lib/brand";
import { MobileMenu, NavLinks } from "./nav-links";

export function Logo() {
  return (
    <Link href="/" className="flex min-h-11 items-center gap-2 font-semibold tracking-tight">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-on-accent">
        <FrameCorners size={18} weight="bold" aria-hidden />
      </span>
      <span className="text-lg">{brand.name}</span>
    </Link>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-paper/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Logo />
        <NavLinks />
        <div className="flex items-center gap-1">
          <Link href="/#pricing" className="btn-primary !px-4 !py-2.5 max-[359px]:hidden">Get headshots</Link>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line bg-card">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 text-sm text-muted sm:grid-cols-2 md:grid-cols-4 [&_a]:py-2.5 md:[&_a]:py-0.5">
        <div className="sm:col-span-2">
          <Logo />
          <p className="mt-3 max-w-sm">{brand.tagline}. Made in {brand.homeState}. Your selfies are deleted automatically after 7 days.</p>
        </div>
        <div className="flex flex-col md:gap-2">
          <span className="font-semibold text-ink">Product</span>
          <Link href="/#pricing">Pricing</Link>
          <Link href="/teams">Brokerage teams</Link>
          <Link href="/free-just-listed">Free Just Listed maker</Link>
          <Link href="/realtor-headshots">Headshots by city</Link>
        </div>
        <div className="flex flex-col md:gap-2">
          <span className="font-semibold text-ink">Company</span>
          <Link href="/blog">Guides</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms & refunds</Link>
          <a href={`mailto:${brand.supportEmail}`}>{brand.supportEmail}</a>
        </div>
      </div>
      <div className="border-t border-line py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} {brand.name}. REALTOR® is a registered mark of the National Association of REALTORS®; {brand.name} is not affiliated with NAR.
      </div>
    </footer>
  );
}
