"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type HomeHeroProps = {
  slides: {
    description: string;
    highlight: string;
    id: string;
    image: string;
    location: string;
    status: string;
    title: string;
    type: string;
  }[];
};

export function HomeHero({
  slides,
}: HomeHeroProps) {
  const [slideState, setSlideState] = useState({
    activeIndex: 0,
    previousIndex: 0,
  });
  const [nextAutoAdvanceDelay, setNextAutoAdvanceDelay] = useState(6000);

  useEffect(() => {
    if (slides.length < 2) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setSlideState((current) => ({
        activeIndex: (current.activeIndex + 1) % slides.length,
        previousIndex: current.activeIndex,
      }));
      setNextAutoAdvanceDelay(6000);
    }, nextAutoAdvanceDelay);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [nextAutoAdvanceDelay, slideState.activeIndex, slides.length]);

  const handleSlideChange = (direction: "next" | "previous") => {
    if (slides.length < 2) {
      return;
    }

    setSlideState((current) => ({
      activeIndex:
        direction === "next"
          ? (current.activeIndex + 1) % slides.length
          : (current.activeIndex - 1 + slides.length) % slides.length,
      previousIndex: current.activeIndex,
    }));
    setNextAutoAdvanceDelay(30000);
  };

  const currentSlide = slides[slideState.activeIndex] ?? null;

  return (
    <section className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 overflow-hidden border-y border-[color:var(--border)] bg-[color:var(--accent-strong)] text-white shadow-[var(--shadow-card)]">
      <div className="absolute inset-0 z-0">
        {slides.map((slide, index) => {
          const isActive = index === slideState.activeIndex;
          const isPrevious = index === slideState.previousIndex;

          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-all duration-[1800ms] ease-out ${
                isActive
                  ? "z-10 translate-x-0 scale-100 opacity-100"
                  : isPrevious
                    ? "z-0 -translate-x-12 scale-[1.02] opacity-0"
                    : "-z-10 translate-x-12 scale-[1.05] opacity-0"
              }`}
            >
              <Image
                src={slide.image}
                alt=""
                fill
                priority={index === 0}
                sizes="100vw"
                className="object-cover"
              />
            </div>
          );
        })}
        <div className="absolute inset-0 z-20 bg-[linear-gradient(90deg,rgba(4,18,28,0.88),rgba(5,22,33,0.68)_34%,rgba(9,39,55,0.36)_66%,rgba(9,39,55,0.2))]" />
        <div className="absolute inset-0 z-20 bg-[linear-gradient(180deg,rgba(6,25,36,0.24),rgba(6,25,36,0.08),rgba(6,25,36,0.5))]" />
        <div className="absolute inset-0 z-20 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.06),transparent_28%)]" />
      </div>

      <div className="relative z-30 mx-auto grid min-h-[18rem] w-full max-w-7xl items-center gap-5 px-4 py-7 sm:px-6 sm:py-8 lg:min-h-[20rem] lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-8">
        <div className="max-w-[42rem]">
          <div className="inline-flex max-w-full flex-wrap items-center gap-3 rounded-full border border-white/16 bg-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.24em] text-white/80 backdrop-blur-sm">
            <span>GMT Homes</span>
            <span className="h-1.5 w-1.5 rounded-full bg-white/78" />
            <span className="max-w-[22rem] text-white/88 normal-case italic tracking-[0.02em]">
              We drive to excellence, giving you the best always....!!!!
            </span>
          </div>

          <h1 className="mt-4 max-w-4xl font-display text-5xl leading-[0.92] text-white [text-shadow:0_12px_32px_rgba(0,0,0,0.52)] sm:text-6xl lg:text-[4.25rem]">
            Discover homes that match how you want to live.
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-white/92 [text-shadow:0_8px_24px_rgba(0,0,0,0.4)] sm:text-lg">
            Search verified listings for rent or sale across key cities and move into the right property faster.
          </p>

          <form action="/properties" className="mt-6 max-w-2xl">
            <div className="flex flex-col gap-3 rounded-[1.7rem] bg-white p-2 shadow-[0_28px_72px_rgba(0,0,0,0.22)] sm:flex-row sm:items-center">
              <label className="flex-1">
                <span className="sr-only">Search listings</span>
                <input
                  name="query"
                  placeholder="Enter a city, estate, or neighborhood"
                  className="w-full border-0 bg-transparent px-4 py-4 text-base text-slate-900 outline-none placeholder:text-slate-400"
                />
              </label>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-[1.25rem] bg-[color:var(--accent-strong)] px-5 py-4 text-sm font-semibold text-white transition hover:bg-[color:color-mix(in_oklab,var(--accent-strong)_88%,black)] sm:min-w-[11.5rem]"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-4 w-4 fill-none stroke-current stroke-2"
                >
                  <circle cx="11" cy="11" r="6" />
                  <path d="M20 20l-4.2-4.2" />
                </svg>
                <span>Search homes</span>
              </button>
            </div>
          </form>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <div className="rounded-full border border-white/14 bg-black/18 px-4 py-2 text-white/88 backdrop-blur-sm">
              Verified listings
            </div>
            <div className="rounded-full border border-white/14 bg-white/10 px-4 py-2 text-white/90 backdrop-blur-sm">
              Rotating home gallery
            </div>
            <div className="rounded-full border border-white/14 bg-white/10 px-4 py-2 text-white/74 backdrop-blur-sm">
              Browse with manual controls
            </div>
          </div>
        </div>

        <div className="justify-self-start lg:justify-self-end">
          <div className="max-w-[28rem] rounded-[1.8rem] border border-white/18 bg-[linear-gradient(145deg,rgba(8,24,35,0.76),rgba(14,45,62,0.56),rgba(255,255,255,0.08))] p-5 shadow-[0_28px_72px_rgba(0,0,0,0.3)] backdrop-blur-md sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/72">
                Active slide details
              </p>
              <div className="rounded-full border border-white/16 bg-black/18 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/76">
                Slide {slideState.activeIndex + 1} / {slides.length}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
              <div className="rounded-full border border-white/14 bg-black/18 px-4 py-2 text-white/88">
                {currentSlide?.status ?? "Featured listing"}
              </div>
              <div className="rounded-full border border-white/14 bg-white/10 px-4 py-2 text-white/90">
                {currentSlide?.type ?? "Property"}
              </div>
            </div>

            <h2 className="mt-4 font-display text-4xl leading-none text-white [text-shadow:0_8px_24px_rgba(0,0,0,0.3)]">
              {currentSlide?.title ?? "Property spotlight"}
            </h2>
            <p className="mt-3 text-sm font-semibold uppercase tracking-[0.18em] text-white/72">
              {currentSlide?.location ?? "Prime location"}
            </p>
            <p className="mt-4 text-sm leading-7 text-white/84">
              {currentSlide?.description ??
                "Explore standout homes chosen from the property directory."}
            </p>

            <div className="mt-5 rounded-[1.4rem] border border-white/14 bg-black/14 px-4 py-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/70">
                Highlight
              </p>
              <p className="mt-2 text-sm leading-7 text-white/84">
                {currentSlide?.highlight ??
                  "High-quality homes rotate here with supporting details kept visible."}
              </p>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => handleSlideChange("previous")}
                aria-label="Show previous hero image"
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/18 bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/16"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-5 w-5 fill-none stroke-current stroke-2"
                >
                  <path d="M15 6l-6 6 6 6" />
                </svg>
              </button>

              <button
                type="button"
                onClick={() => handleSlideChange("next")}
                aria-label="Show next hero image"
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/18 bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/16"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-5 w-5 fill-none stroke-current stroke-2"
                >
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </button>

              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/68">
                Manual selection pauses auto-slide for 30 seconds
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
