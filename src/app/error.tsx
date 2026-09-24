"use client";

import { ErrorState } from "@/components/error-state";

export default function RootError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-4 md:px-6">
      <ErrorState onRetry={retry} />
    </div>
  );
}
