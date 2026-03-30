import Link from "next/link";
import { HomeHero } from "@/components/home-hero";
import { getFeaturedProperties, properties } from "@/data/properties";
import { PropertyCard } from "@/components/property-card";

export default function Home() {
  const featuredProperties = getFeaturedProperties();
  const averagePrice = Math.round(
    properties.reduce((total, property) => total + property.price, 0) /
      properties.length,
  );
  const heroSlidesMap = new Map<
    string,
    {
      description: string;
      highlight: string;
      id: string;
      image: string;
      location: string;
      status: string;
      title: string;
      type: string;
    }
  >();

  for (const property of properties) {
    for (const [index, image] of property.gallery.entries()) {
      if (heroSlidesMap.has(image)) {
        continue;
      }

      heroSlidesMap.set(image, {
        description: property.shortDescription,
        highlight: property.highlight,
        id: `${property.id}-${index}`,
        image,
        location: `${property.location}, ${property.city}`,
        status: property.status,
        title: property.title,
        type: property.type,
      });
    }
  }

  const heroSlides = Array.from(heroSlidesMap.values());
  const averagePriceLabel = new Intl.NumberFormat("en-NG", {
    currency: "NGN",
    notation: "compact",
    style: "currency",
  }).format(averagePrice);
  const forRentCount = properties
    .filter((property) => property.status === "For Rent")
    .length.toString();
  const snapshotCards = [
    {
      body: "See how many active homes are currently available for visitors exploring GMT Homes.",
      icon: (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-6 w-6 fill-none stroke-current stroke-2"
        >
          <path d="M4 19V5" />
          <path d="M10 19V10" />
          <path d="M16 19V7" />
          <path d="M22 19H2" />
        </svg>
      ),
      toneClassName: "app-detail-card--blue",
      title: "Live listings",
      value: properties.length.toString(),
    },
    {
      body: "GMT Homes keeps standout homes visible first so customers can move toward premium options faster.",
      icon: (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-6 w-6 fill-none stroke-current stroke-2"
        >
          <path d="M12 3l7 4v5c0 5-3 8-7 9-4-1-7-4-7-9V7l7-4z" />
        </svg>
      ),
      toneClassName: "app-detail-card--mint",
      title: "Featured homes",
      value: featuredProperties.length.toString(),
    },
    {
      body: "Rental-ready homes remain easy to identify for customers who want flexible living without delay.",
      icon: (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-6 w-6 fill-none stroke-current stroke-2"
        >
          <path d="M5 15l4-4 3 3 7-7" />
          <path d="M14 7h5v5" />
        </svg>
      ),
      toneClassName: "app-detail-card--violet",
      title: "Rental opportunities",
      value: forRentCount,
    },
    {
      body: "Use the current pricing benchmark to understand value and make more confident buying decisions.",
      icon: (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-6 w-6 fill-none stroke-current stroke-2"
        >
          <path d="M12 1v22" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14.5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
      toneClassName: "app-detail-card--sky",
      title: "Avg asking price",
      value: averagePriceLabel,
    },
  ];
  const overviewCards = [
    {
      body: "GMT Homes helps visitors focus on homes with strong value, appealing pricing, and worthwhile opportunities, so every search feels more rewarding from the beginning.",
      icon: (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-6 w-6 fill-none stroke-current stroke-2"
        >
          <path d="M12 1v22" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14.5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
      toneClassName: "app-detail-card--blue",
      title: "Better value from the start",
    },
    {
      body: "From first visit to final shortlist, GMT Homes speaks to customers like a trusted property partner, helping them feel supported instead of overwhelmed.",
      icon: (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-6 w-6 fill-none stroke-current stroke-2"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="10" cy="7" r="4" />
          <path d="M20 8v6" />
          <path d="M23 11h-6" />
        </svg>
      ),
      toneClassName: "app-detail-card--mint",
      title: "Guidance that feels personal",
    },
  ];
  const benefitsCards = [
    {
      body: "GMT Homes helps customers find homes that deliver daily comfort, family-friendly living, and better long-term value, so moving forward feels both exciting and financially sensible.",
      icon: (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-6 w-6 fill-none stroke-current stroke-2"
        >
          <path d="M3 11.5L12 4l9 7.5" />
          <path d="M5 10.5V20h14v-9.5" />
        </svg>
      ),
      toneClassName: "app-detail-card--blue",
      title: "Homes with comfort and value",
    },
    {
      body: "Investors can explore promising properties, compare stronger value opportunities, and identify homes with better income or growth potential through GMT Homes.",
      icon: (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-6 w-6 fill-none stroke-current stroke-2"
        >
          <path d="M5 15l4-4 3 3 7-7" />
          <path d="M14 7h5v5" />
        </svg>
      ),
      toneClassName: "app-detail-card--mint",
      title: "Investment opportunities that make sense",
    },
    {
      body: "GMT Homes also reflects the importance of protection-minded decisions, helping customers think beyond the purchase price and appreciate the reassurance that proper cover can bring.",
      icon: (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-6 w-6 fill-none stroke-current stroke-2"
        >
          <path d="M12 3l7 4v5c0 5-3 8-7 9-4-1-7-4-7-9V7l7-4z" />
        </svg>
      ),
      toneClassName: "app-detail-card--violet",
      title: "Protection and peace of mind",
    },
  ];

  return (
    <div className="pb-16">
      <HomeHero slides={heroSlides} />

      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
          <section className="rounded-[2rem] border border-[color:var(--border)] bg-[linear-gradient(135deg,color-mix(in_oklab,var(--accent)_18%,transparent),color-mix(in_oklab,var(--accent-strong)_14%,transparent),var(--surface))] px-5 py-7 shadow-[var(--shadow-card)] sm:px-7 sm:py-8">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[color:var(--muted)]">
              Homepage overview
            </p>
            <h2 className="mt-4 max-w-3xl font-display text-5xl leading-none text-[color:var(--foreground)]">
              GMT Homes helps every visitor feel closer to the right home from the very first click.
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-[color:var(--muted)]">
              Whether someone is browsing for a fresh rental, a family home, or a premium investment, GMT Homes opens with a clear search path, trusted listing context, and simple next steps that keep the experience personal and easy to explore.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/properties"
                className="inline-flex items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--accent-strong)] px-5 py-3 text-sm font-semibold text-white shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5"
              >
                Browse listings
              </Link>
              <Link
                href="/add-property"
                className="inline-flex items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-5 py-3 text-sm font-semibold text-[color:var(--foreground)] shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5"
              >
                Add a property
              </Link>
            </div>

            <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
              {overviewCards.map((item) => (
                <div
                  key={item.title}
                  className={`app-detail-card ${item.toneClassName} px-3 py-3`}
                >
                  <div className="app-detail-card__icon scale-[0.8] origin-top-left">
                    {item.icon}
                  </div>
                  <p className="mt-3 font-display text-[1.55rem] leading-none text-[color:var(--foreground)]">
                    {item.title}
                  </p>
                  <p className="mt-2 text-[0.92rem] leading-5 text-[color:var(--muted)]">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="overflow-hidden rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--surface)] shadow-[var(--shadow-card)]">
            <div className="bg-[linear-gradient(135deg,#213054,#334c93_58%,#4f35a6)] px-5 py-6 text-white sm:px-6 sm:py-7">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="max-w-md">
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/74">
                    Snapshot
                  </p>
                  <h3 className="mt-3 font-display text-[2.35rem] leading-none sm:text-[2.6rem]">
                    Your GMT Homes market advantage at a glance.
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-white/78">
                    A compact look at live opportunities, featured homes, rental activity, and pricing signals for confident decision-making.
                  </p>
                </div>

                <div className="inline-flex items-center rounded-full border border-white/16 bg-white/8 px-3.5 py-1.5 text-sm font-semibold text-white/90 backdrop-blur-sm">
                  Live property view
                </div>
              </div>
            </div>

            <div className="grid gap-2.5 p-4 sm:grid-cols-2 sm:p-5">
              {snapshotCards.map((item) => (
                <div
                  key={item.title}
                  className={`app-detail-card ${item.toneClassName} px-3 py-3`}
                >
                  <div className="app-detail-card__icon scale-[0.8] origin-top-left">
                    {item.icon}
                  </div>
                  <p className="mt-3 text-[1.55rem] font-black text-[color:var(--foreground)]">
                    {item.value}
                  </p>
                  <p className="mt-1.5 font-display text-[1.35rem] leading-none text-[color:var(--foreground)]">
                    {item.title}
                  </p>
                  <p className="mt-2 text-[0.92rem] leading-5 text-[color:var(--muted)]">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>

      <section className="mx-auto mt-4 flex w-full max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[color:var(--muted)]">
              Featured properties
            </p>
            <h2 className="mt-3 font-display text-5xl text-[color:var(--foreground)]">
              Homes worth exploring first
            </h2>
          </div>
          <Link
            href="/properties"
            className="inline-flex items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-5 py-3 text-sm font-semibold text-[color:var(--foreground)] shadow-[var(--shadow-soft)]"
          >
            Browse all listings
          </Link>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          {featuredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 grid w-full max-w-7xl gap-5 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
        {benefitsCards.map((item) => (
          <div
            key={item.title}
            className={`app-detail-card ${item.toneClassName} p-4 sm:p-5`}
          >
            <div className="app-detail-card__icon scale-[0.82] origin-top-left">
              {item.icon}
            </div>
            <h3 className="mt-3 font-display text-[2rem] text-[color:var(--foreground)]">
              {item.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
              {item.body}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}
