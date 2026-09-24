"use client";

import { ErrorState } from "@/components/error-state";

export default function ShellError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <ErrorState onRetry={retry} homeHref="/app" />;
}
