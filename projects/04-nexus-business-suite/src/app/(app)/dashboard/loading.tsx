export default function DashboardLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading dashboard">
      <div className="h-7 w-48 animate-pulse rounded bg-surface-sunken" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg border border-line bg-surface" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="h-72 animate-pulse rounded-lg border border-line bg-surface lg:col-span-3" />
        <div className="h-72 animate-pulse rounded-lg border border-line bg-surface lg:col-span-2" />
      </div>
    </div>
  );
}
