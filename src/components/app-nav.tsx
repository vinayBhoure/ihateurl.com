"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/app", label: "Collections", match: (p: string) => p === "/app" || p.startsWith("/app/collections") },
  { href: "/app/search", label: "Search", match: (p: string) => p.startsWith("/app/search") },
  { href: "/app/settings", label: "Settings", match: (p: string) => p.startsWith("/app/settings") },
];

/** App sections with the current one marked (`aria-current="page"`). */
export function AppNav({
  orientation = "horizontal",
  onNavigate,
}: {
  orientation?: "horizontal" | "vertical";
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav aria-label="App" className={cn("flex gap-1", orientation === "vertical" && "flex-col")}>
      {ITEMS.map(({ href, label, match }) => (
        <Link
          key={href}
          href={href}
          aria-current={match(pathname) ? "page" : undefined}
          onClick={onNavigate}
          className="inline-flex min-h-11 items-center rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground aria-[current=page]:bg-accent aria-[current=page]:text-foreground md:min-h-9"
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
