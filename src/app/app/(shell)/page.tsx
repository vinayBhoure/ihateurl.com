import type { Metadata } from "next";
import { FolderOpen } from "lucide-react";
import { NewCollectionDialog } from "@/components/collection-form-dialog";
import { CollectionRow } from "@/components/collection-row";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { requirePageUser } from "@/server/auth/current-user";
import { listMyCollections } from "@/server/queries/collections";

export const metadata: Metadata = { title: "Collections" };

export default async function CollectionsPage() {
  const user = await requirePageUser();
  const collections = await listMyCollections(user.id);

  return (
    <div className="space-y-6">
      <PageHeader title="Collections" actions={collections.length > 0 && <NewCollectionDialog />} />

      {collections.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No collections yet"
          description="Create one to start saving links."
          action={<NewCollectionDialog />}
        />
      ) : (
        <ul className="divide-y rounded-lg border">
          {collections.map((c) => (
            <li key={c.id}>
              <CollectionRow collection={c} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
