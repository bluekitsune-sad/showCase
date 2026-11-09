export default function AppLoading() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Loading">
      <div className="space-y-2">
        <div className="h-6 w-40 animate-pulse rounded bg-surface-sunken" />
        <div className="h-4 w-64 animate-pulse rounded bg-surface-sunken" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-lg border border-line bg-surface"
          />
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-lg border border-line bg-surface" />
    </div>
  );
}
