export default function BillingLoading() {
  return (
    <div className="space-y-8 animate-page-enter max-w-5xl">
      <div className="space-y-2">
        <div className="skeleton h-8 w-56 rounded-xl" />
        <div className="skeleton h-4 w-72 rounded-lg" />
      </div>
      <div className="skeleton h-40 w-full rounded-2xl" />
      <div className="grid gap-5 md:grid-cols-3">
        {[0, 1, 2].map(i => <div key={i} className="skeleton h-80 rounded-2xl" />)}
      </div>
      <div className="skeleton h-48 w-full rounded-2xl" />
    </div>
  )
}
