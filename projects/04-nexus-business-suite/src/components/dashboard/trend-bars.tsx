type TrendPoint = {
  label: string;
  value: number;
  display: string;
};

export function TrendBars({
  title,
  caption,
  points,
  emptyMessage,
  ariaLabel,
  tone = "accent",
  maxValue,
}: {
  title: string;
  caption?: string;
  points: TrendPoint[];
  emptyMessage: string;
  ariaLabel: string;
  tone?: "accent" | "success";
  maxValue?: number;
}) {
  const max = maxValue ?? points.reduce((highest, point) => Math.max(highest, point.value), 0);
  const barClass = tone === "success" ? "bg-success" : "bg-accent";

  return (
    <section className="h-full rounded-lg border border-line bg-surface p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
        {caption && <p className="text-xs text-ink-subtle">{caption}</p>}
      </div>

      {points.length === 0 || max <= 0 ? (
        <p className="mt-3 text-sm text-ink-muted">{emptyMessage}</p>
      ) : (
        <figure className="mt-4">
          <div className="flex items-end gap-2" role="img" aria-label={ariaLabel}>
            {points.map((point) => (
              <div
                key={point.label}
                className="flex min-w-0 flex-1 flex-col items-center gap-1"
              >
                <span className="text-[10px] tabular-nums text-ink-subtle">
                  {point.display}
                </span>
                <div className="flex h-28 w-full items-end">
                  <div
                    className={`w-full rounded-t ${barClass}`}
                    style={{
                      height: `${
                        point.value > 0
                          ? Math.max((point.value / max) * 100, 4)
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <span className="w-full truncate text-center text-[10px] text-ink-muted">
                  {point.label}
                </span>
              </div>
            ))}
          </div>
          <figcaption className="sr-only">{ariaLabel}</figcaption>
          <ul className="sr-only">
            {points.map((point) => (
              <li key={point.label}>
                {point.label}: {point.display}
              </li>
            ))}
          </ul>
        </figure>
      )}
    </section>
  );
}
