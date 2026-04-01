"use client";

import { useTheme } from "@/components/app-providers";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--foreground)] shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:border-[color:var(--accent)]"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
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
          <circle cx="12" cy="12" r="4.5" />
          <path d="M12 2.5v2.25" />
          <path d="M12 19.25v2.25" />
          <path d="M4.93 4.93 6.5 6.5" />
          <path d="m17.5 17.5 1.57 1.57" />
          <path d="M2.5 12h2.25" />
          <path d="M19.25 12h2.25" />
          <path d="M4.93 19.07 6.5 17.5" />
          <path d="m17.5 6.5 1.57-1.57" />
        </svg>
      ) : (
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
          <path d="M21 12.8A8.8 8.8 0 1 1 11.2 3 7.2 7.2 0 0 0 21 12.8Z" />
        </svg>
      )}
    </button>
  );
}

