import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/** Muted "← label" link above a page title. 44 px tap target below 768 px, underline on hover. */
export function BackLink({ href, label = "Back to collections" }: { href: string; label?: string }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-11 items-center gap-1.5 rounded-sm text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none md:min-h-0"
    >
      <ArrowLeft aria-hidden className="size-4" />
      {label}
    </Link>
  );
}
