"use client";

import { useFavorites } from "@/components/app-providers";

type FavoriteButtonProps = {
  slug: string;
  className?: string;
};

export function FavoriteButton({
  slug,
  className = "",
}: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const saved = isFavorite(slug);

  return (
    <button
      type="button"
      onClick={() => toggleFavorite(slug)}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition hover:-translate-y-0.5 ${saved ? "border-[color:var(--accent)] bg-[color:var(--accent)] text-white" : "border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--foreground)]"} ${className}`}
      aria-pressed={saved}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      >
        <path d="m12 20.25-1.3-1.18C5.8 14.62 3 12.03 3 8.85 3 6.27 5.03 4.25 7.6 4.25c1.46 0 2.86.68 3.75 1.76.89-1.08 2.3-1.76 3.75-1.76 2.57 0 4.9 2.02 4.9 4.6 0 3.18-2.8 5.77-7.7 10.22L12 20.25Z" />
      </svg>
      <span>{saved ? "Saved" : "Save"}</span>
    </button>
  );
}

