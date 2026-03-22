export default function EmailActivityLoading() {
  return (
    <div className="flex flex-col gap-5 h-[calc(100vh-3.5rem)] animate-page-enter">
      {/* Header skeleton */}
      <div className="flex items-center justify-between shrink-0">
        <div className="space-y-2">
          <div className="skeleton h-8 w-48 rounded-xl" />
          <div className="skeleton h-4 w-72 rounded-lg" />
        </div>
        <div className="skeleton h-9 w-24 rounded-xl" />
      </div>

      {/* Two-panel layout skeleton */}
      <div className="flex gap-4 flex-1 min-h-0">
        {/* Left panel - email list */}
        <div className="w-80 shrink-0 flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="skeleton h-4 w-28 rounded-lg" />
                <div className="skeleton h-3 w-12 rounded-lg" />
              </div>
              <div className="skeleton h-3 w-full rounded-lg" />
              <div className="skeleton h-3 w-2/3 rounded-lg" />
            </div>
          ))}
        </div>

        {/* Right panel - thread view */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <div className="space-y-2 pb-4 border-b border-gray-100">
            <div className="skeleton h-6 w-2/3 rounded-xl" />
            <div className="skeleton h-4 w-1/3 rounded-lg" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton h-4 w-full rounded-lg" />
            ))}
            <div className="skeleton h-4 w-4/5 rounded-lg" />
          </div>
          <div className="skeleton h-24 w-full rounded-xl mt-4" />
        </div>
      </div>
    </div>
  )
}
