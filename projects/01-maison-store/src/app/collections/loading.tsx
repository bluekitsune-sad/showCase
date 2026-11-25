export default function CollectionsLoading() {
  return (
    <div className="container-x py-14 lg:py-20" aria-busy="true">
      <span className="sr-only">Loading collections</span>
      <div className="h-4 w-40 animate-pulse rounded-sm bg-surface-sunken" />
      <div className="mt-8 h-12 w-64 animate-pulse rounded-sm bg-surface-sunken" />
      <div className="mt-4 h-4 w-full max-w-xl animate-pulse rounded-sm bg-surface-sunken" />
      <div className="mt-12 divide-y divide-line border-y border-line">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="grid gap-6 py-7 sm:grid-cols-12 sm:items-center"
          >
            <div className="aspect-[4/3] animate-pulse rounded-sm bg-surface-sunken sm:col-span-3 sm:aspect-[3/2]" />
            <div className="sm:col-span-7">
              <div className="h-7 w-56 animate-pulse rounded-sm bg-surface-sunken" />
              <div className="mt-3 h-3 w-20 animate-pulse rounded-sm bg-surface-sunken" />
              <div className="mt-4 h-3 w-full max-w-md animate-pulse rounded-sm bg-surface-sunken" />
            </div>
            <div className="h-3 w-28 animate-pulse rounded-sm bg-surface-sunken sm:col-span-2 sm:ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
