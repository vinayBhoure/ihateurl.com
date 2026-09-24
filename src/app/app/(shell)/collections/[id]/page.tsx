import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { EditCollectionDialog } from "@/components/collection-form-dialog";
import { CollectionMenu } from "@/components/collection-menu";
import { PageHeader } from "@/components/page-header";
import { PublicLinkBar } from "@/components/public-link-bar";
import { Badge } from "@/components/ui/badge";
import { VisibilityBadge } from "@/components/visibility-badge";
import { env } from "@/config/env";
import { requirePageUser } from "@/server/auth/current-user";
import { listCategories } from "@/server/queries/categories";
import { getMyCollection } from "@/server/queries/collections";

type Props = { params: Promise<{ id: string }> };

// Shared by generateMetadata and the page (R4).
const loadCollection = cache(async (id: string) => {
  const user = await requirePageUser();
  return { user, collection: await getMyCollection(user.id, id) };
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { collection } = await loadCollection((await params).id);
  return { title: collection?.title ?? "Collection" };
}

export default async function CollectionPage({ params }: Props) {
  const { user, collection } = await loadCollection((await params).id);
  if (!collection) notFound();

  const categories = await listCategories(user.id);
  const publicUrl = `${env.appUrl}/${user.username}/${collection.slug}`;
  const collectionCategories = collection.categories.map(({ category }) => category);

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <PageHeader
          title={collection.title}
          description={collection.description}
          actions={
            <>
              <EditCollectionDialog
                username={user.username}
                categories={categories}
                collection={{
                  id: collection.id,
                  title: collection.title,
                  slug: collection.slug,
                  description: collection.description,
                  visibility: collection.visibility,
                  categoryIds: collectionCategories.map((c) => c.id),
                }}
              />
              <CollectionMenu id={collection.id} title={collection.title} />
            </>
          }
        />
        <div className="flex flex-wrap items-center gap-2">
          <VisibilityBadge visibility={collection.visibility} />
          {collectionCategories.map((c) => (
            <Badge key={c.id} variant="secondary" className="font-medium">
              {c.name}
            </Badge>
          ))}
        </div>
        {collection.visibility === "PUBLIC" && <PublicLinkBar url={publicUrl} title={collection.title} />}
      </header>
    </div>
  );
}
