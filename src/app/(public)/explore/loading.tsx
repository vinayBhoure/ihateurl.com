import { Skeleton } from "@/components/ui/skeleton";

export default function ExploreLoading() {
  return (
    <div role="status" className="mx-auto w-full max-w-5xl space-y-8 px-4 py-12 md:px-6">
      <span className="sr-only">Loading…</span>
      <div className="space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-10 w-3/4 md:h-12" />
          <Skeleton className="h-6 w-2/3" />
        </div>
        <Skeleton className="h-12 w-full md:max-w-2xl" />
      </div>
      <div className="flex gap-2 overflow-hidden md:flex-wrap">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-11 w-20 shrink-0 rounded-full md:h-8" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="space-y-4 rounded-xl border p-5">
            <div className="flex gap-4">
              <Skeleton className="size-12 shrink-0 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
            <Skeleton className="h-3 w-1/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
