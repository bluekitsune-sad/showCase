"use client";

import { useState } from "react";
import { toneGradient } from "@/lib/format";

type GalleryImage = {
  id: number;
  alt: string;
};

type ProductGalleryProps = {
  slug: string;
  name: string;
  images: GalleryImage[];
};

export function ProductGallery({ slug, name, images }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? {
    id: 0,
    alt: `${name} photographed flat against a pale background`,
  };

  return (
    <div>
      <div
        className="relative overflow-hidden rounded-sm border border-line"
        style={{ background: toneGradient(`${slug}-${active}`) }}
      >
        <div className="aspect-[4/5]" role="img" aria-label={current.alt} />
      </div>

      {images.length > 1 ? (
        <ul className="mt-3 grid grid-cols-4 gap-3" aria-label="Product images">
          {images.map((image, index) => (
            <li key={image.id}>
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-pressed={index === active}
                aria-label={`Show image ${index + 1}: ${image.alt}`}
                className={`block w-full overflow-hidden rounded-sm border transition-colors ${
                  index === active
                    ? "border-accent"
                    : "border-line hover:border-line-strong"
                }`}
                style={{ background: toneGradient(`${slug}-${index}`) }}
              >
                <span className="block aspect-square" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
