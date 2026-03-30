"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useFavorites } from "@/components/app-providers";
import { ThemeToggle } from "@/components/theme-toggle";

const navigationItems = [
  { href: "/", label: "Home" },
  { href: "/properties", label: "Listings" },
  { href: "/add-property", label: "Add Property" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { favoriteCount } = useFavorites();

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--border)] bg-[color:color-mix(in_oklab,var(--background)_82%,transparent)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-3 text-[color:var(--foreground)]"
          onClick={closeMenu}
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:var(--accent-strong)] text-sm font-black tracking-[0.24em] text-white">
            GMT
          </div>
          <div>
            <p className="font-display text-[2rem] font-black leading-none tracking-[0.01em]">
              GMT Homes
            </p>
            <p className="text-xs font-bold italic tracking-[0.08em] text-[color:color-mix(in_oklab,var(--muted)_82%,white_18%)]">
              We drive to excellence, giving you the best always....!!!!
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 lg:flex">
          {navigationItems.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${active ? "bg-[color:var(--accent-strong)] text-white" : "text-[color:var(--muted)] hover:bg-[color:var(--surface)] hover:text-[color:var(--foreground)]"}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/properties?saved=1"
            className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:border-[color:var(--accent)]"
          >
            <span>Saved</span>
            <span className="rounded-full bg-[color:var(--surface-strong)] px-2 py-0.5 text-xs">
              {favoriteCount}
            </span>
          </Link>
          <ThemeToggle />
        </div>

        <div className="flex items-center gap-3 lg:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--foreground)] shadow-[var(--shadow-soft)]"
            aria-expanded={menuOpen}
            aria-label="Toggle navigation menu"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
            >
              {menuOpen ? (
                <>
                  <path d="M6 6 18 18" />
                  <path d="M18 6 6 18" />
                </>
              ) : (
                <>
                  <path d="M4 7h16" />
                  <path d="M4 12h16" />
                  <path d="M4 17h16" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div className="border-t border-[color:var(--border)] lg:hidden">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6 lg:px-8">
            {navigationItems.map((item) => {
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${active ? "bg-[color:var(--accent-strong)] text-white" : "bg-[color:var(--surface)] text-[color:var(--foreground)]"}`}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/properties?saved=1"
              onClick={closeMenu}
              className="flex items-center justify-between rounded-2xl bg-[color:var(--surface)] px-4 py-3 text-sm font-semibold text-[color:var(--foreground)]"
            >
              <span>Saved properties</span>
              <span className="rounded-full bg-[color:var(--surface-strong)] px-2 py-1 text-xs">
                {favoriteCount}
              </span>
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
