export default function Loading() {
  return (
    <div className="container-x py-10 lg:py-16" aria-busy="true">
      <span className="sr-only">Loading your saved addresses</span>
      <div className="h-4 w-40 animate-pulse rounded-sm bg-surface-sunken" />
      <div className="mt-8 h-12 w-full max-w-xl animate-pulse rounded-sm bg-surface-sunken" />
      <div className="mt-4 h-4 w-full max-w-lg animate-pulse rounded-sm bg-surface-sunken" />
      <div className="mt-10 max-w-3xl space-y-4">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="h-36 animate-pulse rounded-sm border border-line bg-surface-sunken"
          />
        ))}
      </div>
    </div>
  );
}
