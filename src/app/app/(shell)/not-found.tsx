import Link from "next/link";
import { Button } from "@/components/ui/button";

// Same message for missing and not-owned records (NOT_FOUND in both cases).
export default function ShellNotFound() {
  return (
    <div className="flex flex-col items-center gap-6 py-16 text-center">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-[-0.015em]">Not found</h1>
        <p className="text-muted-foreground">This doesn&apos;t exist, or it isn&apos;t yours.</p>
      </div>
      <Button asChild>
        <Link href="/app">Back to collections</Link>
      </Button>
    </div>
  );
}
