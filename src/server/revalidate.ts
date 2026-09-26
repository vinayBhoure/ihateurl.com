import { revalidatePath } from "next/cache";

/** "Collection paths" in docs/architecture/server-actions.md. `publicId` never changes (C3.1). */
export function revalidateCollectionPaths(username: string, id: string, publicId: string, slugs: string[]) {
  revalidatePath("/app");
  revalidatePath(`/app/collections/${id}`);
  revalidatePath(`/u/${username}`);
  for (const slug of new Set(slugs)) revalidatePath(`/u/${username}/${slug}/${publicId}`);
}

export function revalidateCollections(
  username: string,
  collections: { id: string; slug: string; publicId: string }[]
) {
  for (const c of collections) revalidateCollectionPaths(username, c.id, c.publicId, [c.slug]);
}
