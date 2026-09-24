"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

/** Body of an `error.tsx` boundary. Never shows error details. `onRetry` is the boundary's `retry`. */
export function ErrorState({ onRetry, homeHref = "/" }: { onRetry: () => void; homeHref?: string }) {
  return (
    <div className="flex flex-col items-center gap-6 py-16 text-center">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-[-0.015em]">Something went wrong</h1>
        <p className="text-muted-foreground">Please try again. If it keeps happening, come back later.</p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Button type="button" onClick={onRetry}>
          Try again
        </Button>
        <Button asChild variant="outline">
          <Link href={homeHref}>Go home</Link>
        </Button>
      </div>
    </div>
  );
}
