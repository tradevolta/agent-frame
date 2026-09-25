"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { List, X } from "@phosphor-icons/react";

const LINKS = [
  { href: "/#styles", label: "Styles" },
  { href: "/#brand-kit", label: "Brand Kit" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/teams", label: "Teams" },
  { href: "/free-just-listed", label: "Free tool" },
  { href: "/blog", label: "Guides" },
];

const isActive = (pathname: string, href: string) => !href.startsWith("/#") && pathname.startsWith(href);

export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className="hidden items-center gap-6 text-sm md:flex">
      {LINKS.map((l) => {
        const active = isActive(pathname, l.href);
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

/** Phone menu: a button in the header that opens a full-width panel of links. */
export function MobileMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Links close the menu on click; Escape closes it too. Lock page scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        className="grid h-11 w-11 place-items-center rounded-lg text-ink transition active:scale-95"
      >
        {open ? <X size={24} aria-hidden /> : <List size={24} aria-hidden />}
      </button>
      {/* Portal: the header's backdrop-blur would otherwise trap this fixed panel inside the header. */}
      {open ? createPortal(
        <div id="mobile-menu" className="fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto border-t border-line bg-paper px-4 pb-8 md:hidden">
          <nav aria-label="Mobile" className="flex flex-col divide-y divide-line">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                aria-current={isActive(pathname, l.href) ? "page" : undefined}
                className="py-4 text-lg font-medium aria-[current=page]:text-accent"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <Link href="/#pricing" onClick={() => setOpen(false)} className="btn-primary mt-6 w-full py-3.5 text-base">
            Get headshots
          </Link>
        </div>,
        document.body,
      ) : null}
    </div>
  );
}
