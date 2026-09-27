import Link from "next/link";
import { ArrowRight, Link2 } from "lucide-react";
import { CollectionTile } from "@/components/collection-tile";
import { FaviconStack } from "@/components/favicon-stack";
import { RelativeTime } from "@/components/relative-time";
import { SaveBookmarkButton } from "@/components/save-bookmark-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { viewerStatusFor, type Viewer } from "@/server/auth/current-user";
import type { PublicCollectionCardData } from "@/server/queries/public";

type CardOwner = { username: string; displayName: string | null; avatarUrl: string | null };

/**
 * Plan 8 §2.1: a public collection as a card (Explore, landing, profile). The card itself is not
 * a link, so the bookmark button is never nested inside one. `from="profile"` makes the
 * collection page's back link return to the profile; `returnPath` is where sign-in comes back to.
 */
export function CollectionCard({
  collection: c,
  owner,
  showOwner = true,
  viewer,
  saved,
  returnPath,
  from,
  headingAs: Heading = "h3",
}: {
  collection: PublicCollectionCardData;
  owner: CardOwner;
  showOwner?: boolean;
  viewer: Viewer;
  saved: boolean;
  returnPath: string;
  from?: "profile";
  headingAs?: "h2" | "h3";
}) {
  const href = `/u/${owner.username}/${c.slug}/${c.publicId}${from ? `?from=${from}` : ""}`;
  const count = c._count.items;
  const ownerName = owner.displayName ?? owner.username;

  return (
    <article className="flex h-full flex-col rounded-xl border bg-card p-5 text-card-foreground transition-colors hover:border-foreground/20">
      <div className="flex items-start gap-4">
        <CollectionTile id={c.id} category={c.categories[0]?.category.name} />
        <div className="min-w-0 flex-1 space-y-2">
          <Heading className="font-semibold break-words">
            <Link href={href} className="hover:underline">
              {c.title}
            </Link>
          </Heading>
          {c.description && (
            <p className="line-clamp-2 text-sm break-words text-muted-foreground">{c.description}</p>
          )}
          <FaviconStack links={c.items.map((item) => item.link)} total={count} className="pt-1" />
        </div>
        <div className="-mt-2 -mr-2 shrink-0">
          <SaveBookmarkButton
            collectionId={c.id}
            viewer={viewerStatusFor(viewer, owner.username)}
            saved={saved}
            canSave={c.allowCopy}
            returnPath={returnPath}
          />
        </div>
      </div>

      <div className="mt-auto pt-5">
        <div className="space-y-3 border-t pt-4">
          {showOwner && (
            <Link
              href={`/u/${owner.username}`}
              className="flex min-h-11 w-fit max-w-full items-center gap-3 md:min-h-0"
            >
              <Avatar>
                {owner.avatarUrl && <AvatarImage src={owner.avatarUrl} alt="" />}
                <AvatarFallback>{ownerName.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="min-w-0">
                {owner.displayName && (
                  <span className="block truncate text-sm font-medium hover:underline">{owner.displayName}</span>
                )}
                <span className="block truncate font-mono text-xs text-muted-foreground">@{owner.username}</span>
              </span>
            </Link>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Link2 aria-hidden className="size-3.5 shrink-0" />
              <span>
                {count} {count === 1 ? "link" : "links"} · Updated <RelativeTime date={c.updatedAt} />
              </span>
            </p>
            <Button asChild variant="outline" size="sm">
              <Link href={href} aria-label={`View collection ${c.title}`}>
                View collection
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
