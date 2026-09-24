import { Skeleton } from "@/components/ui/skeleton";

export default function ExploreLoading() {
  return (
    <div role="status" className="mx-auto w-full max-w-5xl space-y-8 px-4 py-12 md:px-6">
      <span className="sr-only">Loading…</span>
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-11 max-w-xl md:h-9" />
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-11 w-20 md:h-8" />
        ))}
      </div>
      <div className="divide-y rounded-lg border">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="space-y-2 px-4 py-3">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
