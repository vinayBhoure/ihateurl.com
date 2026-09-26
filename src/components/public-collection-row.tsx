import Link from "next/link";
import { LocalDate } from "@/components/local-date";

export type PublicCollectionRowData = {
  title: string;
  slug: string;
  publicId: string;
  description?: string | null;
  updatedAt: Date;
  _count: { items: number };
};

/**
 * A public collection in a list (profile, explore). `owner` adds "by …" for explore.
 * `from="profile"` makes the collection page's back link return to the profile.
 */
export function PublicCollectionRow({
  username,
  collection: c,
  owner,
  from,
}: {
  username: string;
  collection: PublicCollectionRowData;
  owner?: { username: string };
  from?: "profile";
}) {
  return (
    <Link
      href={`/u/${username}/${c.slug}/${c.publicId}${from ? `?from=${from}` : ""}`}
      className="block min-h-11 space-y-1 px-4 py-3 transition-colors hover:bg-accent"
    >
      <p className="truncate text-sm font-medium">{c.title}</p>
      {c.description && <p className="truncate text-sm text-muted-foreground">{c.description}</p>}
      <p className="flex flex-wrap gap-x-3 text-xs text-muted-foreground">
        {owner && <span className="truncate font-mono">by @{owner.username}</span>}
        <span>
          {c._count.items} {c._count.items === 1 ? "link" : "links"}
        </span>
        <span>
          Updated <LocalDate date={c.updatedAt} />
        </span>
      </p>
    </Link>
  );
}
