export function SkeletonCard() {
  return (
    <div className="bg-white border border-[#E8E4DC] overflow-hidden">
      <div className="aspect-[4/3] skeleton" />
      <div className="p-5 space-y-3">
        <div className="h-3 skeleton rounded w-1/3" />
        <div className="h-5 skeleton rounded w-3/4" />
        <div className="h-3 skeleton rounded w-full" />
        <div className="h-3 skeleton rounded w-2/3" />
        <div className="flex justify-between items-center mt-4">
          <div className="h-5 skeleton rounded w-1/3" />
          <div className="h-8 skeleton rounded w-1/4" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonGrid({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
