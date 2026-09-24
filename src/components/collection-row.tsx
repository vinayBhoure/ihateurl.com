import Link from "next/link";
import { LocalDate } from "@/components/local-date";
import { VisibilityBadge } from "@/components/visibility-badge";

export type CollectionRowData = {
  id: string;
  title: string;
  visibility: "PRIVATE" | "PUBLIC";
  updatedAt: Date;
  _count: { items: number };
};

/** One of the user's collections in a list; opens its detail page. */
export function CollectionRow({ collection: c }: { collection: CollectionRowData }) {
  return (
    <Link
      href={`/app/collections/${c.id}`}
      className="flex min-h-11 flex-col gap-1 px-4 py-3 transition-colors hover:bg-accent md:flex-row md:items-center md:gap-4"
    >
      <span className="min-w-0 truncate text-sm font-medium md:flex-1">{c.title}</span>
      <span className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
        <VisibilityBadge visibility={c.visibility} />
        <span>
          {c._count.items} {c._count.items === 1 ? "link" : "links"}
        </span>
        <LocalDate date={c.updatedAt} />
      </span>
    </Link>
  );
}
