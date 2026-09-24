import { Skeleton } from "@/components/ui/skeleton";

export default function ShellLoading() {
  return (
    <div role="status" className="space-y-6">
      <span className="sr-only">Loading…</span>
      <Skeleton className="h-8 w-48" />
      <div className="divide-y rounded-lg border">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="flex min-h-11 items-center gap-3 px-4 py-3">
            <Skeleton className="size-4 shrink-0" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </div>
    </div>
  );
}
