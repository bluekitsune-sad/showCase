export default function CartLoading() {
  return (
    <div className="container-x py-10 lg:py-16" aria-busy="true">
      <span className="sr-only">Loading your bag</span>
      <div className="h-4 w-40 animate-pulse rounded-sm bg-surface-sunken" />
      <div className="mt-6 h-11 w-56 animate-pulse rounded-sm bg-surface-sunken" />
      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-14">
        <div className="space-y-6">
          {[0, 1, 2].map((row) => (
            <div key={row} className="flex gap-4 border-t border-line pt-6 sm:gap-6">
              <div className="h-28 w-24 animate-pulse rounded-sm bg-surface-sunken sm:h-32 sm:w-28" />
              <div className="flex-1 space-y-3 py-1">
                <div className="h-4 w-2/3 animate-pulse rounded-sm bg-surface-sunken" />
                <div className="h-3 w-1/3 animate-pulse rounded-sm bg-surface-sunken" />
                <div className="h-3 w-24 animate-pulse rounded-sm bg-surface-sunken" />
                <div className="h-9 w-32 animate-pulse rounded-sm bg-surface-sunken" />
              </div>
            </div>
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-sm border border-line bg-surface" />
      </div>
    </div>
  );
}
