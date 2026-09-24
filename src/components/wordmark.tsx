import Link from "next/link";
import { cn } from "@/lib/utils";

/** Text wordmark for headers, footer and auth pages. 44 px tall below 768 px. */
export function Wordmark({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-11 items-center text-base font-semibold tracking-[-0.015em] md:min-h-0",
        className
      )}
    >
      ihateurl
    </Link>
  );
}
