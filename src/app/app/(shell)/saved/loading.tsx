import { Skeleton } from "@/components/ui/skeleton";

export default function SavedLoading() {
  return (
    <div role="status" className="space-y-6">
      <span className="sr-only">Loading…</span>
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-11 w-full md:h-9" />
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
