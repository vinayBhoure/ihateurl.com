import Link from "next/link";

const TABS = [
  { href: "/app", label: "My collections" },
  { href: "/app/saved", label: "Saved collections" },
] as const;

export type CollectionTab = (typeof TABS)[number]["href"];

/** Plan 9 §2.4: `/app`'s tabs as links, so each tab has its own URL; the current one is marked. */
export function CollectionTabs({ current }: { current: CollectionTab }) {
  return (
    <nav aria-label="Collections" className="flex gap-1 border-b">
      {TABS.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          aria-current={href === current ? "page" : undefined}
          className="-mb-px inline-flex min-h-11 items-center rounded-t-md border-b-2 border-transparent px-3 text-sm font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background aria-[current=page]:border-foreground aria-[current=page]:text-foreground md:min-h-9"
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
