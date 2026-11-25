export default function CheckoutLoading() {
  return (
    <div className="container-x py-10 lg:py-16" aria-busy="true">
      <span className="sr-only">Loading checkout</span>
      <div className="h-4 w-48 animate-pulse rounded-sm bg-surface-sunken" />
      <div className="mt-8 h-12 w-56 animate-pulse rounded-sm bg-surface-sunken" />
      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-14">
        <div className="space-y-8">
          {Array.from({ length: 2 }).map((_, group) => (
            <div key={group}>
              <div className="h-5 w-40 animate-pulse rounded-sm bg-surface-sunken" />
              <div className="mt-4 space-y-4">
                {Array.from({ length: 3 }).map((_, field) => (
                  <div
                    key={field}
                    className="h-11 animate-pulse rounded-sm bg-surface-sunken"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="h-80 animate-pulse rounded-sm border border-line bg-surface-sunken" />
      </div>
    </div>
  );
}
