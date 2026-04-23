export const PropertyCardSkeleton = () => (
  <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
    <div className="bg-gray-200 aspect-[4/3] w-full" />
    <div className="p-5 space-y-3">
      <div className="h-5 bg-gray-200 rounded w-1/2" />
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-1/3" />
      <div className="flex gap-4 pt-2">
        {[1,2,3].map(i => <div key={i} className="h-4 bg-gray-200 rounded w-16" />)}
      </div>
    </div>
  </div>
);