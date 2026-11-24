import Image from "next/image";
import { toneGradient } from "@/lib/format";

type ProductMediaProps = {
  seed: string;
  alt: string;
  url?: string | null;
  sizes?: string;
  priority?: boolean;
};

/**
 * Seeded product imagery. A real photo URL is served through next/image with
 * responsive sizes and optional priority loading; without one, the
 * deterministic gradient placeholder renders as an accessible image so the
 * demo never requests an external asset.
 */
export function ProductMedia({
  seed,
  alt,
  url,
  sizes = "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw",
  priority = false,
}: ProductMediaProps) {
  if (url) {
    return (
      <Image
        src={url}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
    );
  }

  return (
    <span
      role="img"
      aria-label={alt}
      className="absolute inset-0 block"
      style={{ background: toneGradient(seed) }}
    />
  );
}
