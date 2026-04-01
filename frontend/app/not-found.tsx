import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl items-center justify-center px-4 py-16 text-center sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--surface)] px-8 py-12 shadow-[var(--shadow-card)]">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[color:var(--muted)]">
          404 error
        </p>
        <h1 className="mt-4 font-display text-6xl text-[color:var(--foreground)]">
          Page not found
        </h1>
        <p className="mt-4 text-base leading-8 text-[color:var(--muted)]">
          The page you are looking for does not exist, or the link may have
          changed.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-[color:var(--accent-strong)] px-5 py-3 text-sm font-semibold text-white"
          >
            Go home
          </Link>
          <Link
            href="/properties"
            className="inline-flex items-center justify-center rounded-full border border-[color:var(--border)] px-5 py-3 text-sm font-semibold text-[color:var(--foreground)]"
          >
            Browse properties
          </Link>
        </div>
      </div>
    </div>
  );
}
