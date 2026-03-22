export default function SettingsLoading() {
  return (
    <div className="space-y-6 max-w-2xl animate-page-enter">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="skeleton h-8 w-28 rounded-xl" />
        <div className="skeleton h-4 w-64 rounded-lg" />
      </div>

      {/* Settings sections skeleton */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <div className="skeleton h-5 w-36 rounded-lg" />
          <div className="space-y-3">
            <div className="skeleton h-10 w-full rounded-xl" />
            <div className="skeleton h-10 w-full rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  )
}
