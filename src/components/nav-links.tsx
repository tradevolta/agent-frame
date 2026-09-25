"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/#styles", label: "Styles" },
  { href: "/#brand-kit", label: "Brand Kit" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/teams", label: "Teams" },
  { href: "/free-just-listed", label: "Free tool" },
  { href: "/blog", label: "Guides" },
];

export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className="hidden items-center gap-6 text-sm md:flex">
      {LINKS.map((l) => {
        const active = !l.href.startsWith("/#") && pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={`transition-colors duration-200 hover:text-ink ${active ? "font-medium text-ink" : "text-muted"}`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
