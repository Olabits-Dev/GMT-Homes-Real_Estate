"use client";

import { useEffect } from "react";
import Image from "next/image";

type ImageLightboxProps = {
  activeIndex: number;
  images: string[];
  onClose: () => void;
  onSelect: (index: number) => void;
  title: string;
};

export function ImageLightbox({
  activeIndex,
  images,
  onClose,
  onSelect,
  title,
}: ImageLightboxProps) {
  const totalImages = images.length;
  const currentImage = images[activeIndex];
  const showNavigation = totalImages > 1;

  useEffect(() => {
    const previousDocumentOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (!showNavigation) {
        return;
      }

      if (event.key === "ArrowRight") {
        onSelect((activeIndex + 1) % totalImages);
      }

      if (event.key === "ArrowLeft") {
        onSelect((activeIndex - 1 + totalImages) % totalImages);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.documentElement.style.overflow = previousDocumentOverflow;
      document.body.style.overflow = previousBodyOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeIndex, onClose, onSelect, showNavigation, totalImages]);

  const goToPrevious = () => {
    onSelect((activeIndex - 1 + totalImages) % totalImages);
  };

  const goToNext = () => {
    onSelect((activeIndex + 1) % totalImages);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${title} image viewer`}
      className="fixed inset-0 z-50 bg-[color:color-mix(in_oklab,black_78%,var(--accent-strong)_22%)]/95 px-4 py-6 backdrop-blur-sm sm:px-6 lg:px-10"
      onClick={onClose}
    >
      <div
        className="mx-auto flex h-full max-w-6xl flex-col gap-4"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 text-white">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/70">
              Image preview
            </p>
            <p className="mt-2 text-base font-medium text-white/90">
              {title}
              {showNavigation ? ` · ${activeIndex + 1} of ${totalImages}` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-full border border-white/18 bg-white/8 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/12"
          >
            Close
          </button>
        </div>

        <div className="relative flex-1 overflow-hidden rounded-[2rem] border border-white/10 bg-black/30 shadow-[0_28px_80px_rgba(0,0,0,0.35)]">
          <Image
            src={currentImage}
            alt={`${title} image ${activeIndex + 1}`}
            fill
            priority
            sizes="100vw"
            className="object-contain"
          />

          {showNavigation ? (
            <>
              <button
                type="button"
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-full border border-white/14 bg-black/35 px-4 py-3 text-sm font-semibold text-white transition hover:bg-black/50"
              >
                Prev
              </button>
              <button
                type="button"
                onClick={goToNext}
                className="absolute right-4 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-full border border-white/14 bg-black/35 px-4 py-3 text-sm font-semibold text-white transition hover:bg-black/50"
              >
                Next
              </button>
            </>
          ) : null}
        </div>

        {showNavigation ? (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-6">
            {images.map((image, index) => {
              const active = index === activeIndex;

              return (
                <button
                  key={image}
                  type="button"
                  onClick={() => onSelect(index)}
                  className={`relative aspect-[4/3] overflow-hidden rounded-[1.25rem] border transition ${active ? "border-white ring-2 ring-white/25" : "border-white/12 opacity-80 hover:opacity-100"}`}
                  aria-label={`Show image ${index + 1}`}
                >
                  <Image
                    src={image}
                    alt={`${title} preview ${index + 1}`}
                    fill
                    sizes="(min-width: 1024px) 12vw, 24vw"
                    className="object-cover"
                  />
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
