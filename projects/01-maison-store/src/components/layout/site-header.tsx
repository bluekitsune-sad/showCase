"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type NavCollection = { name: string; slug: string };

const MAIN_LINKS = [
  { label: "Shop", href: "/collections" },
  { label: "Our story", href: "/#story" },
];

export function SiteHeader({
  collections,
  cartCount,
  customerName,
}: {
  collections: NavCollection[];
  cartCount: number;
  customerName: string | null;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMegaOpen(false);
        setMenuOpen(false);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  function closeAll() {
    setMegaOpen(false);
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
      <div className="container-x flex h-16 items-center gap-4">
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-line text-ink lg:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            {menuOpen ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            )}
          </svg>
        </button>

        <Link
          href="/"
          onClick={closeAll}
          className="font-display text-2xl leading-none tracking-[0.26em] text-ink sm:text-[1.7rem]"
        >
          MAISON
        </Link>

        <nav aria-label="Main" className="ml-6 hidden items-center gap-7 lg:flex">
          <div className="relative">
            <button
              type="button"
              className="inline-flex h-16 items-center gap-1.5 text-sm text-ink hover:text-accent"
              aria-expanded={megaOpen}
              aria-controls="mega-panel"
              onClick={() => setMegaOpen((open) => !open)}
            >
              Collections
              <svg
                aria-hidden="true"
                viewBox="0 0 12 8"
                className={`h-2 w-3 transition-transform ${megaOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
              >
                <path d="M1 1.5 6 6.5l5-5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          {MAIN_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-ink hover:text-accent"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-5">
          <Link
            href="/wishlist"
            className="hidden text-sm text-ink hover:text-accent sm:inline"
          >
            Wishlist
          </Link>
          <Link
            href={customerName ? "/account" : "/account/sign-in"}
            className="text-sm text-ink hover:text-accent"
          >
            {customerName ? customerName.split(" ")[0] : "Account"}
          </Link>
          <Link
            href="/cart"
            aria-label={
              cartCount > 0
                ? `Bag, ${cartCount} ${cartCount === 1 ? "item" : "items"}`
                : "Bag, empty"
            }
            className="flex items-center gap-1.5 text-sm text-ink hover:text-accent"
          >
            Bag
            {cartCount > 0 ? (
              <span
                aria-hidden="true"
                className="min-w-5 rounded-full bg-accent px-1.5 py-0.5 text-center text-[0.65rem] leading-tight text-surface"
              >
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            ) : null}
          </Link>
        </div>
      </div>

      {megaOpen ? (
        <div
          id="mega-panel"
          className="absolute inset-x-0 top-full hidden border-b border-line bg-surface shadow-[0_18px_30px_-24px_rgba(25,24,22,0.5)] lg:block"
        >
          <div className="container-x grid grid-cols-12 gap-10 py-9">
            <p className="col-span-3 text-sm leading-relaxed text-ink-muted">
              Four small collections, restocked slowly. Start with the tailoring,
              then find the layer that goes underneath it.
            </p>
            <ul className="col-span-6 grid grid-cols-2 gap-x-8 gap-y-3">
              {collections.map((collection) => (
                <li key={collection.slug}>
                  <Link
                    href={`/collections/${collection.slug}`}
                    onClick={closeAll}
                    className="font-display text-xl text-ink hover:text-accent"
                  >
                    {collection.name}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="col-span-3 flex items-start justify-end">
              <Link
                href="/collections"
                onClick={closeAll}
                className="btn btn-ghost"
              >
                View all collections
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      {menuOpen ? (
        <div
          id="mobile-nav"
          className="border-t border-line bg-surface lg:hidden"
        >
          <nav aria-label="Mobile" className="container-x py-6">
            <p className="text-xs uppercase tracking-[0.14em] text-ink-subtle">
              Collections
            </p>
            <ul className="mt-3 space-y-1">
              {collections.map((collection) => (
                <li key={collection.slug}>
                  <Link
                    href={`/collections/${collection.slug}`}
                    onClick={closeAll}
                    className="block py-2 font-display text-xl text-ink"
                  >
                    {collection.name}
                  </Link>
                </li>
              ))}
            </ul>
            <hr className="rule my-5" />
            <ul className="space-y-1">
              {MAIN_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={closeAll}
                    className="block py-2 text-base text-ink"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href={customerName ? "/account" : "/account/sign-in"}
                  onClick={closeAll}
                  className="block py-2 text-base text-ink"
                >
                  {customerName ? "Your account" : "Sign in"}
                </Link>
              </li>
              <li>
                <Link
                  href="/cart"
                  onClick={closeAll}
                  className="block py-2 text-base text-ink"
                >
                  Bag
                </Link>
              </li>
              <li>
                <Link
                  href="/wishlist"
                  onClick={closeAll}
                  className="block py-2 text-base text-ink"
                >
                  Wishlist
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
