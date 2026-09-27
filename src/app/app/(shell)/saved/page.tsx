import type { Metadata } from "next";
import Link from "next/link";
import { Bookmark } from "lucide-react";
import { CollectionCard } from "@/components/collection-card";
import { NewCollectionDialog } from "@/components/collection-form-dialog";
import { CollectionTabs } from "@/components/collection-tabs";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { requirePageUser, type Viewer } from "@/server/auth/current-user";
import { listMySavedCollections } from "@/server/queries/collections";

export const metadata: Metadata = { title: "Saved collections" };

/** Plan 9: other people's public collections the user saved, newest save first. */
export default async function SavedCollectionsPage() {
  const user = await requirePageUser();
  const collections = await listMySavedCollections(user.id);
  const viewer: Viewer = { status: "member", userId: user.id, username: user.username };

  return (
    <div className="space-y-6">
      <PageHeader title="Collections" actions={<NewCollectionDialog />} />
      <CollectionTabs current="/app/saved" />

      {collections.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="Nothing saved yet"
          description="Save public collections from Explore to find them here."
          action={
            <Button asChild variant="outline">
              <Link href="/explore">Explore</Link>
            </Button>
          }
        />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {collections.map((c) => (
            <li key={c.id}>
              <CollectionCard
                collection={c}
                owner={c.user}
                viewer={viewer}
                saved
                returnPath="/app/saved"
                headingAs="h2"
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
