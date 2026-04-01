"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logout } from "@/app/actions/auth";
import { useFavorites } from "@/components/app-providers";
import { FormSubmitButton } from "@/components/form-submit-button";
import { ThemeToggle } from "@/components/theme-toggle";
import type { AuthUser } from "@/types/auth";

type SiteHeaderProps = {
  viewer: AuthUser | null;
};

export function SiteHeader({ viewer }: SiteHeaderProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { favoriteCount } = useFavorites();
  const canPublish = viewer?.role === "agent" || viewer?.role === "admin";
  const viewerFirstName = viewer?.name.trim().split(/\s+/)[0] ?? null;
  const navigationItems = viewer
    ? [
        { href: "/", label: "Home" },
        { href: "/properties", label: "Listings" },
        { href: "/dashboard", label: "Dashboard" },
        ...(canPublish ? [{ href: "/add-property", label: "Add Property" }] : []),
        ...(viewer.role === "admin" ? [{ href: "/admin", label: "Admin" }] : []),
      ]
    : [
        { href: "/", label: "Home" },
        { href: "/properties", label: "Listings" },
      ];

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--border)] bg-[color:color-mix(in_oklab,var(--background)_82%,transparent)] backdrop-blur-xl">
      <div className="mx-auto grid w-full max-w-[92rem] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:gap-5 sm:px-6 sm:py-4 lg:grid-cols-[minmax(0,auto)_minmax(0,1fr)_auto] lg:px-6 xl:px-8 2xl:max-w-[100rem]">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2.5 text-[color:var(--foreground)] sm:gap-3"
          onClick={closeMenu}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color:var(--accent-strong)] text-[0.78rem] font-black tracking-[0.22em] text-white sm:h-11 sm:w-11 sm:rounded-2xl sm:text-sm sm:tracking-[0.24em]">
            GMT
          </div>
          <div className="min-w-0">
            <p className="truncate font-display text-[1.55rem] font-black leading-none tracking-[0.01em] sm:text-[2rem]">
              GMT Homes
            </p>
            <p className="hidden max-w-[13.75rem] truncate text-[0.58rem] font-bold italic tracking-[0.02em] text-[color:color-mix(in_oklab,var(--muted)_82%,white_18%)] min-[390px]:block sm:max-w-none sm:text-xs sm:tracking-[0.08em]">
              We drive to excellence, giving you the best always....!!!!
            </p>
          </div>
        </Link>

        <nav className="hidden min-w-0 flex-wrap items-center justify-center gap-1.5 lg:flex xl:gap-2">
          {navigationItems.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold transition xl:px-4 ${active ? "bg-[color:var(--accent-strong)] text-white" : "text-[color:var(--muted)] hover:bg-[color:var(--surface)] hover:text-[color:var(--foreground)]"}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden min-w-0 items-center justify-end gap-2 lg:flex xl:gap-3">
          {viewer ? (
            <div
              className="max-w-[11rem] truncate rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2 text-sm font-semibold text-[color:var(--foreground)] shadow-[var(--shadow-soft)] xl:max-w-[13rem] xl:px-4 2xl:max-w-[15rem]"
              title={`${viewer.name} · ${viewer.role}`}
            >
              <span className="2xl:hidden">{viewerFirstName}</span>
              <span className="hidden 2xl:inline">{viewer.name}</span> · {viewer.role}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full border border-[color:var(--border)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] transition hover:-translate-y-0.5"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-full bg-[color:var(--accent-strong)] px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5"
              >
                Create account
              </Link>
            </>
          )}
          <Link
            href="/properties?saved=1"
            className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2 text-sm font-semibold text-[color:var(--foreground)] shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:border-[color:var(--accent)] xl:px-4"
          >
            <span className="hidden xl:inline">Saved</span>
            <span className="rounded-full bg-[color:var(--surface-strong)] px-2 py-0.5 text-xs">
              {favoriteCount}
            </span>
          </Link>
          {viewer ? (
            <form action={logout}>
              <FormSubmitButton
                pendingLabel="Signing out..."
                className="inline-flex items-center justify-center rounded-full border border-[color:var(--border)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Sign out
              </FormSubmitButton>
            </form>
          ) : null}
          <ThemeToggle />
        </div>

        <div className="flex shrink-0 items-center gap-2.5 sm:gap-3 lg:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--foreground)] shadow-[var(--shadow-soft)] sm:h-11 sm:w-11"
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
          <div className="mx-auto flex w-full max-w-[92rem] flex-col gap-2.5 px-4 py-4 sm:gap-3 sm:px-6 lg:px-6 xl:px-8 2xl:max-w-[100rem]">
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
            {viewer ? (
              <form action={logout} onSubmit={closeMenu}>
                <FormSubmitButton
                  pendingLabel="Signing out..."
                  className="inline-flex w-full items-center justify-center rounded-2xl border border-[color:var(--border)] px-4 py-3 text-sm font-semibold text-[color:var(--foreground)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Sign out
                </FormSubmitButton>
              </form>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={closeMenu}
                  className="rounded-2xl bg-[color:var(--surface)] px-4 py-3 text-sm font-semibold text-[color:var(--foreground)]"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  onClick={closeMenu}
                  className="rounded-2xl bg-[color:var(--accent-strong)] px-4 py-3 text-sm font-semibold text-white"
                >
                  Create account
                </Link>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
