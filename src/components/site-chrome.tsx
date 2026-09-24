import Link from "next/link";
import { brand } from "@/lib/brand";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-navy text-sm text-white">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
          <path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3" />
          <circle cx="12" cy="10" r="2.5" />
          <path d="M7.5 17c.8-2 2.5-3 4.5-3s3.7 1 4.5 3" />
        </svg>
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
        <nav className="hidden items-center gap-6 text-sm text-muted md:flex">
          <Link href="/#styles" className="hover:text-ink">Styles</Link>
          <Link href="/#brand-kit" className="hover:text-ink">Brand Kit</Link>
          <Link href="/#pricing" className="hover:text-ink">Pricing</Link>
          <Link href="/teams" className="hover:text-ink">Teams</Link>
          <Link href="/free-just-listed" className="hover:text-ink">Free tool</Link>
          <Link href="/blog" className="hover:text-ink">Guides</Link>
        </nav>
        <Link href="/#pricing" className="btn-primary !py-2">Get headshots</Link>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line bg-card">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 text-sm text-muted md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-3 max-w-sm">{brand.tagline}. Made in {brand.homeState}. Your selfies are deleted automatically after 7 days.</p>
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-semibold text-ink">Product</span>
          <Link href="/#pricing">Pricing</Link>
          <Link href="/teams">Brokerage teams</Link>
          <Link href="/free-just-listed">Free Just Listed maker</Link>
          <Link href="/realtor-headshots">Headshots by city</Link>
        </div>
        <div className="flex flex-col gap-2">
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
