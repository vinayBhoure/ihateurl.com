import Link from "next/link";
import { Button } from "@/components/ui/button";

// Same page for missing and private content, so nothing leaks (access-and-security).
export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-6 px-4 py-16 text-center md:px-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-[-0.015em]">Page not found</h1>
        <p className="text-muted-foreground">This page doesn&apos;t exist or isn&apos;t public.</p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Button asChild>
          <Link href="/">Go home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/explore">Explore collections</Link>
        </Button>
      </div>
    </div>
  );
}
