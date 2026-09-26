import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { FolderOpen } from "lucide-react";
import { CopyButton } from "@/components/copy-button";
import { EmptyState } from "@/components/empty-state";
import { PublicCollectionRow } from "@/components/public-collection-row";
import { ShareButton } from "@/components/share-button";
import { SocialLinks } from "@/components/social-links";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { env } from "@/config/env";
import { getPublicProfile } from "@/server/queries/public";

type Props = { params: Promise<{ username: string }> };

// One query for generateMetadata and the page (R4).
const loadProfile = cache((username: string) => getPublicProfile(username));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const profile = await loadProfile((await params).username);
  if (!profile) return {};

  const title = `${profile.displayName ?? profile.username} (@${profile.username})`;
  const description = profile.bio ?? `Public collections by @${profile.username}`;
  const url = `/u/${profile.username}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: "website", url, title, description, images: ["/og.png"] },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ProfilePage({ params }: Props) {
  const profile = await loadProfile((await params).username);
  if (!profile) notFound();

  const name = profile.displayName ?? profile.username;
  const url = `${env.appUrl}/u/${profile.username}`;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8 px-4 py-12 md:px-6">
      <header className="flex items-start gap-4">
        <Avatar className="size-16">
          {profile.avatarUrl && <AvatarImage src={profile.avatarUrl} alt="" />}
          <AvatarFallback className="text-lg">{name.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1 space-y-1">
          <h1 className="text-2xl font-semibold tracking-[-0.015em] break-words">{name}</h1>
          <p className="font-mono text-sm text-muted-foreground">@{profile.username}</p>
          {profile.bio && <p className="pt-2 break-words whitespace-pre-line">{profile.bio}</p>}
          {/* Negative margin lines the icons up with the text above; buttons keep their 44 px target. */}
          <SocialLinks
            links={profile.socialLinks}
            ownerName={name}
            className="-ml-3.5 pt-2 md:-ml-2.5"
          />
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <CopyButton value={url} label="Copy profile link" />
          <ShareButton title={name} url={url} label="Share profile" />
        </div>
      </header>

      <section aria-labelledby="collections-heading" className="space-y-3">
        <h2 id="collections-heading" className="text-xl font-semibold">
          Public collections
        </h2>
        {profile.collections.length === 0 ? (
          <EmptyState icon={FolderOpen} title="No public collections yet." />
        ) : (
          <ul className="divide-y rounded-lg border">
            {profile.collections.map((c) => (
              <li key={c.slug}>
                <PublicCollectionRow username={profile.username} collection={c} from="profile" />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
