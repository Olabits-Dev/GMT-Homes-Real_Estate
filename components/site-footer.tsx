import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-[color:var(--border)] bg-[color:color-mix(in_oklab,var(--surface)_88%,transparent)]">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.2fr_repeat(3,0.8fr)] lg:px-8">
        <div className="space-y-4">
          <p className="font-display text-3xl text-[color:var(--foreground)]">
            GMT Homes
          </p>
          <p className="max-w-md text-sm font-bold italic leading-7 text-[color:color-mix(in_oklab,var(--muted)_82%,white_18%)]">
            We drive to excellence give you the best always.....!!!
          </p>
          <p className="max-w-md text-sm leading-7 text-[color:var(--muted)]">
            Helping customers discover standout properties for rent, sale, and
            investment opportunities across Nigeria.
          </p>
        </div>

        <div className="space-y-3 text-sm">
          <p className="font-semibold uppercase tracking-[0.24em] text-[color:var(--muted)]">
            Explore
          </p>
          <Link href="/" className="block text-[color:var(--foreground)]">
            Homepage
          </Link>
          <Link href="/properties" className="block text-[color:var(--foreground)]">
            Property listings
          </Link>
          <Link
            href="/add-property"
            className="block text-[color:var(--foreground)]"
          >
            Add property
          </Link>
        </div>

        <div className="space-y-3 text-sm">
          <p className="font-semibold uppercase tracking-[0.24em] text-[color:var(--muted)]">
            Contact
          </p>
          <a
            href="https://wa.me/2348035208600"
            target="_blank"
            rel="noreferrer"
            className="block text-[color:var(--foreground)]"
          >
            Chat on WhatsApp
          </a>
          <a
            href="tel:+2348035208600"
            className="block text-[color:var(--foreground)]"
          >
            +234 803 520 8600
          </a>
          <p className="text-[color:var(--foreground)]">Lagos and Abuja</p>
        </div>

        <div className="space-y-3 text-sm">
          <p className="font-semibold uppercase tracking-[0.24em] text-[color:var(--muted)]">
            Built with
          </p>
          <p className="text-[color:var(--foreground)]">Next.js App Router</p>
          <p className="text-[color:var(--foreground)]">React 19</p>
          <p className="text-[color:var(--foreground)]">Tailwind CSS 4</p>
        </div>
      </div>
    </footer>
  );
}
