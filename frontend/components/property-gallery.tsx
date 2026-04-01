"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageLightbox } from "@/components/image-lightbox";

type PropertyGalleryProps = {
  title: string;
  gallery: string[];
};

export function PropertyGallery({ title, gallery }: PropertyGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="relative aspect-[16/10] overflow-hidden rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] shadow-[var(--shadow-card)]">
        <button
          type="button"
          onClick={() => setIsLightboxOpen(true)}
          className="group relative h-full w-full cursor-zoom-in text-left"
          aria-label={`Open ${title} image ${activeIndex + 1} in full view`}
        >
          <Image
            src={gallery[activeIndex]}
            alt={`${title} image ${activeIndex + 1}`}
            fill
            priority
            className="object-cover transition duration-500 group-hover:scale-[1.02]"
            sizes="(min-width: 1024px) 60vw, 100vw"
          />
          <span className="pointer-events-none absolute bottom-4 right-4 rounded-full bg-[color:color-mix(in_oklab,var(--accent-strong)_84%,black_16%)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white">
            View full image
          </span>
        </button>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {gallery.map((image, index) => {
          const active = index === activeIndex;

          return (
            <button
              key={image}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`relative aspect-[4/3] overflow-hidden rounded-[1.5rem] border transition ${active ? "border-[color:var(--accent)] ring-2 ring-[color:var(--accent)]/20" : "border-[color:var(--border)]"}`}
              aria-label={`Show image ${index + 1}`}
            >
              <Image
                src={image}
                alt={`${title} thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 20vw, 33vw"
              />
            </button>
          );
        })}
      </div>
      {isLightboxOpen ? (
        <ImageLightbox
          activeIndex={activeIndex}
          images={gallery}
          onClose={() => setIsLightboxOpen(false)}
          onSelect={setActiveIndex}
          title={title}
        />
      ) : null}
    </div>
  );
}
