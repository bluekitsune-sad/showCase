export default function AccountLoading() {
  return (
    <div className="container-x py-10 lg:py-16" aria-busy="true">
      <span className="sr-only">Loading your account</span>
      <div className="h-4 w-40 animate-pulse rounded-sm bg-surface-sunken" />
      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-14">
        <div>
          <div className="h-3 w-28 animate-pulse rounded-sm bg-surface-sunken" />
          <div className="mt-4 h-12 w-3/4 max-w-md animate-pulse rounded-sm bg-surface-sunken" />
          <div className="mt-5 h-4 w-full max-w-lg animate-pulse rounded-sm bg-surface-sunken" />
          <div className="mt-10 space-y-4 border border-line bg-surface p-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-10 animate-pulse rounded-sm bg-surface-sunken"
              />
            ))}
          </div>
        </div>
        <div className="h-64 animate-pulse rounded-sm border border-line bg-surface-sunken" />
      </div>
    </div>
  );
}
