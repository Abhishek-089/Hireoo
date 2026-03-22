export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-page-enter">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div className="space-y-2">
          <div className="skeleton h-8 w-52 rounded-xl" />
          <div className="skeleton h-4 w-72 rounded-lg" />
        </div>
        <div className="skeleton h-4 w-32 rounded-lg" />
      </div>

      {/* Banner skeleton */}
      <div className="skeleton h-24 w-full rounded-2xl" />

      {/* Progress bar skeleton */}
      <div className="skeleton h-14 w-full rounded-2xl" />

      {/* Stats grid skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-28 rounded-2xl" />
        ))}
      </div>

      {/* Quick actions skeleton */}
      <div className="skeleton h-36 w-full rounded-2xl" />

      {/* Recent activity + matched jobs side by side */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="skeleton h-5 w-36 rounded-lg" />
          </div>
          <div className="divide-y divide-gray-50">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-start gap-4 px-5 py-4">
                <div className="skeleton h-9 w-9 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-32 rounded-lg" />
                  <div className="skeleton h-3 w-48 rounded-lg" />
                  <div className="skeleton h-6 w-20 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="skeleton h-5 w-32 rounded-lg" />
          </div>
          <div className="divide-y divide-gray-50">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                <div className="skeleton h-9 w-9 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-40 rounded-lg" />
                  <div className="skeleton h-3 w-28 rounded-lg" />
                </div>
                <div className="skeleton h-6 w-14 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
