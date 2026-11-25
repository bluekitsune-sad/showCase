export default function ProductLoading() {
  return (
    <div className="container-x py-10 lg:py-16" aria-busy="true">
      <span className="sr-only">Loading this piece</span>
      <div className="h-4 w-52 animate-pulse rounded-sm bg-surface-sunken" />
      <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="aspect-[4/5] animate-pulse rounded-sm border border-line bg-surface-sunken" />
        <div>
          <div className="h-3 w-32 animate-pulse rounded-sm bg-surface-sunken" />
          <div className="mt-4 h-12 w-3/4 animate-pulse rounded-sm bg-surface-sunken" />
          <div className="mt-5 h-5 w-28 animate-pulse rounded-sm bg-surface-sunken" />
          <div className="mt-6 h-4 w-full animate-pulse rounded-sm bg-surface-sunken" />
          <div className="mt-2 h-4 w-5/6 animate-pulse rounded-sm bg-surface-sunken" />
          <div className="mt-8 h-11 w-48 animate-pulse rounded-sm bg-surface-sunken" />
          <div className="mt-8 h-4 w-24 animate-pulse rounded-sm bg-surface-sunken" />
          <div className="mt-4 flex gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-10 w-14 animate-pulse rounded-sm bg-surface-sunken"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
