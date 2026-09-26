import Link from "next/link";
import { LogoLockup } from "@/components/logo";
import { cn } from "@/lib/utils";

/**
 * Logo link for headers, footer and auth pages. The lockup is 1.375em tall, so it scales with
 * the font size set by `className` (22 px at the default `text-base`). 44 px tall below 768 px.
 */
export function Wordmark({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={cn("inline-flex min-h-11 items-center text-base md:min-h-0", className)}>
      <LogoLockup className="h-[1.375em] w-auto" />
      <span className="sr-only">ihateurl</span>
    </Link>
  );
}
