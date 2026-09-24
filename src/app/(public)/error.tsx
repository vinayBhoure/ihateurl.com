"use client";

import { ErrorState } from "@/components/error-state";

// Keeps the public header and footer around the error.
export default function PublicError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 md:px-6">
      <ErrorState onRetry={retry} />
    </div>
  );
}
