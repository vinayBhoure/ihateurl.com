import type { Metadata } from "next";
import { cache } from "react";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Link2 } from "lucide-react";
import { BackLink } from "@/components/back-link";
import { CopyButton } from "@/components/copy-button";
import { EmptyState } from "@/components/empty-state";
import { LinkRow } from "@/components/link-row";
import { LocalDate } from "@/components/local-date";
import { SaveCollectionButton, type SaveViewer } from "@/components/save-collection-button";
import { ShareButton } from "@/components/share-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { env } from "@/config/env";
import { getCurrentUser } from "@/server/auth/current-user";
import { getPublicCollectionByPublicId } from "@/server/queries/public";

type Props = {
  params: Promise<{ username: string; slug: string; publicId: string }>;
  searchParams: Promise<{ from?: string | string[] }>;
};

// One query for generateMetadata and the page (R4). `null` for missing and private alike.
const loadCollection = cache((publicId: string) => getPublicCollectionByPublicId(publicId));

// Outbound links to user-submitted URLs (FP8 + Q3).
const PUBLIC_LINK_REL = "noopener noreferrer nofollow ugc";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { publicId } = await params;
  const collection = await loadCollection(publicId);
  if (!collection) return {};

  const owner = collection.user.username;
  const title = `${collection.title} by @${owner}`;
  const description = collection.description ?? `${collection._count.items} links curated by @${owner}`;
  // Canonical always points at the collection's current username/slug, even on a stale URL.
  const url = `/u/${owner}/${collection.slug}/${collection.publicId}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: "website", url, title, description, images: ["/og.png"] },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function PublicCollectionPage({ params, searchParams }: Props) {
  const { username, slug, publicId } = await params;
  const { from } = await searchParams;
  const collection = await loadCollection(publicId);
  if (!collection) notFound();

  const owner = collection.user;
  // C3.1: publicId is the real key; a rename or slug change lands here via the old URL,
  // so redirect to the current one instead of serving it at a stale address.
  if (username !== owner.username || slug !== collection.slug) {
    permanentRedirect(`/u/${owner.username}/${collection.slug}/${collection.publicId}`);
  }

  const ownerName = owner.displayName ?? owner.username;
  const path = `/u/${owner.username}/${collection.slug}/${collection.publicId}`;
  const count = collection._count.items;
  // Back link: the owner's profile when opened from it (`?from=profile`), otherwise Explore
  // (explore, landing, direct and shared links).
  const fromProfile = (Array.isArray(from) ? from[0] : from) === "profile";
  const back = fromProfile ? `/u/${owner.username}` : "/explore";
  const viewer = await getViewer(owner.username);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8 px-4 py-12 md:px-6">
      <header className="space-y-4">
        <BackLink href={back} />
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-[-0.015em] break-words">{collection.title}</h1>
          {collection.description && (
            <p className="break-words whitespace-pre-line text-muted-foreground">{collection.description}</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
          <Link href={`/u/${owner.username}`} className="inline-flex items-center gap-2 text-foreground hover:underline">
            <Avatar size="sm">
              {owner.avatarUrl && <AvatarImage src={owner.avatarUrl} alt="" />}
              <AvatarFallback className="text-xs">{ownerName.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            {ownerName}
          </Link>
          <span>
            {count} {count === 1 ? "link" : "links"} · Updated <LocalDate date={collection.updatedAt} />
          </span>
        </div>
        {collection.categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {collection.categories.map(({ category }) => (
              <Badge key={category.slug} variant="secondary" className="font-medium">
                {category.name}
              </Badge>
            ))}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2">
          {collection.allowCopy && (
            <SaveCollectionButton collectionId={collection.id} viewer={viewer} returnPath={path} />
          )}
          <CopyButton value={`${env.appUrl}${path}`} label="Copy link" />
          <ShareButton title={collection.title} url={`${env.appUrl}${path}`} />
        </div>
      </header>

      {collection.items.length === 0 ? (
        <EmptyState icon={Link2} title="This collection has no links yet." />
      ) : (
        <ul className="divide-y rounded-lg border">
          {collection.items.map((item) => (
            <li key={item.id}>
              <LinkRow link={{ ...item.link, categories: [] }} rel={PUBLIC_LINK_REL} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

async function getViewer(ownerUsername: string): Promise<SaveViewer> {
  const { userId } = await auth();
  if (!userId) return "signed-out";
  const user = await getCurrentUser();
  if (!user) return "not-onboarded";
  return user.username === ownerUsername ? "owner" : "member";
}
