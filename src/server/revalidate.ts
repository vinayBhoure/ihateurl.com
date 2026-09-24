import { revalidatePath } from "next/cache";

/** "Collection paths" in docs/architecture/server-actions.md. */
export function revalidateCollectionPaths(username: string, id: string, slugs: string[]) {
  revalidatePath("/app");
  revalidatePath(`/app/collections/${id}`);
  revalidatePath(`/${username}`);
  for (const slug of new Set(slugs)) revalidatePath(`/${username}/${slug}`);
}
