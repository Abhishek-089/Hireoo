export default function JobMatchesLoading() {
  return (
    <div className="space-y-6 animate-page-enter">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="skeleton h-8 w-44 rounded-xl" />
        <div className="skeleton h-4 w-80 rounded-lg" />
      </div>

      {/* Stats grid skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-32 rounded-2xl" />
        ))}
      </div>

      {/* Job cards skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2 flex-1">
                <div className="skeleton h-5 w-48 rounded-lg" />
                <div className="skeleton h-4 w-32 rounded-lg" />
              </div>
              <div className="skeleton h-8 w-20 rounded-xl" />
            </div>
            <div className="flex gap-2">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="skeleton h-6 w-16 rounded-full" />
              ))}
            </div>
            <div className="skeleton h-4 w-full rounded-lg" />
            <div className="skeleton h-4 w-3/4 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  )
}
