export default function CollectionLoading() {
  return (
    <div className="container-x py-14 lg:py-20" aria-busy="true">
      <span className="sr-only">Loading this collection</span>
      <div className="h-4 w-64 animate-pulse rounded-sm bg-surface-sunken" />
      <div className="mt-8 h-12 w-72 animate-pulse rounded-sm bg-surface-sunken" />
      <div className="mt-4 h-5 w-48 animate-pulse rounded-sm bg-surface-sunken" />
      <div className="mt-3 h-4 w-full max-w-xl animate-pulse rounded-sm bg-surface-sunken" />
      <div className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index}>
            <div className="aspect-[4/5] animate-pulse rounded-sm bg-surface-sunken" />
            <div className="mt-3 h-4 w-2/3 animate-pulse rounded-sm bg-surface-sunken" />
            <div className="mt-2 h-3 w-1/3 animate-pulse rounded-sm bg-surface-sunken" />
          </div>
        ))}
      </div>
    </div>
  );
}
