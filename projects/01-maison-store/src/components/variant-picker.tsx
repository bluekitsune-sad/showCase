"use client";

import { useState } from "react";
import { AddToBag } from "@/components/add-to-bag";
import { colourHex } from "@/lib/format";

type Variant = {
  id: number;
  size: string;
  colour: string;
  sku: string;
  stock: number;
};

type VariantPickerProps = {
  variants: Variant[];
  sizes: string[];
  colours: string[];
};

export function VariantPicker({ variants, sizes, colours }: VariantPickerProps) {
  const initialColour =
    colours.find((colour) =>
      variants.some((variant) => variant.colour === colour && variant.stock > 0),
    ) ?? colours[0];
  const [colour, setColour] = useState(initialColour ?? "");
  const [size, setSize] = useState("");

  const selected = variants.find(
    (variant) => variant.colour === colour && variant.size === size,
  );
  const stock = selected?.stock ?? 0;
  const hasStock = Boolean(selected) && stock > 0;

  function chooseColour(next: string) {
    setColour(next);
    setSize("");
  }

  let availability = "Choose a size to see availability.";
  if (size) {
    if (!selected) {
      availability = `Not made in ${colour} / ${size}. Try another size.`;
    } else if (stock === 0) {
      availability = `Sold out in ${colour} / ${size}.`;
    } else if (stock <= 3) {
      availability = `Only ${stock} left in ${colour} / ${size}.`;
    } else {
      availability = `In stock in ${colour} / ${size}.`;
    }
  }

  return (
    <div className="mt-8 space-y-7">
      <fieldset>
        <legend className="text-xs uppercase tracking-[0.12em] text-ink-subtle">
          Colour · <span className="text-ink">{colour}</span>
        </legend>
        <div className="mt-3 flex flex-wrap gap-2.5">
          {colours.map((option) => {
            const available = variants.some(
              (variant) => variant.colour === option && variant.stock > 0,
            );
            return (
              <button
                key={option}
                type="button"
                onClick={() => chooseColour(option)}
                aria-pressed={option === colour}
                aria-label={`${option}${available ? "" : " — sold out"}`}
                className={`flex items-center gap-2 rounded-sm border px-2.5 py-1.5 text-xs transition-colors ${
                  option === colour
                    ? "border-accent text-ink"
                    : "border-line text-ink-muted hover:border-line-strong"
                }`}
              >
                <span
                  className="h-4 w-4 rounded-full border border-line-strong"
                  style={{ background: colourHex(option) }}
                  aria-hidden="true"
                />
                {option}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-xs uppercase tracking-[0.12em] text-ink-subtle">
          Size{size ? ` · ${size}` : ""}
        </legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {sizes.map((option) => {
            const variant = variants.find(
              (item) => item.colour === colour && item.size === option,
            );
            const soldOut = !variant || variant.stock === 0;
            return (
              <button
                key={option}
                type="button"
                onClick={() => setSize(option)}
                aria-pressed={option === size}
                aria-label={`${option}${soldOut ? " — sold out in this colour" : ""}`}
                className={`min-h-11 min-w-12 rounded-sm border px-3 text-sm transition-colors ${
                  option === size
                    ? "border-accent bg-accent text-surface"
                    : "border-line-strong text-ink hover:border-ink"
                } ${soldOut && option !== size ? "text-ink-subtle line-through" : ""}`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </fieldset>

      <p className="text-sm text-ink-muted" aria-live="polite">
        {availability}
      </p>

      {selected ? (
        <AddToBag
          key={selected.id}
          variantId={selected.id}
          soldOut={!hasStock}
        />
      ) : (
        <p className="text-xs leading-relaxed text-ink-subtle">
          Choose a colour and size to add this piece to your bag.
        </p>
      )}

      {selected ? (
        <p className="text-xs text-ink-subtle">SKU {selected.sku}</p>
      ) : null}
    </div>
  );
}
