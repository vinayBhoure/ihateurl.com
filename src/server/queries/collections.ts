import { prisma } from "@/config/db";
import { cardSelect, ownerSelect } from "@/server/queries/public";

const categorySelect = { category: { select: { id: true, name: true, slug: true } } } as const;

export async function listMyCollections(userId: string) {
  return prisma.collection.findMany({
    where: { userId },
    select: {
      id: true,
      title: true,
      slug: true,
      visibility: true,
      updatedAt: true,
      _count: { select: { items: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

/** Plan 9: which of `collectionIds` the viewer has saved (bookmarked), for the save buttons. */
export async function listSavedCollectionIds(userId: string, collectionIds: string[]): Promise<Set<string>> {
  if (collectionIds.length === 0) return new Set();
  const rows = await prisma.savedCollection.findMany({
    where: { userId, collectionId: { in: collectionIds } },
    select: { collectionId: true },
  });
  return new Set(rows.map((r) => r.collectionId));
}

/**
 * Plan 9 `/app/saved`, newest save first, as card data + owner. PUBLIC only: a saved collection
 * made private is hidden, not removed, and shows again once public (O4).
 */
export async function listMySavedCollections(userId: string) {
  const rows = await prisma.savedCollection.findMany({
    where: { userId, collection: { visibility: "PUBLIC" } },
    select: { collection: { select: { ...cardSelect, user: { select: ownerSelect } } } },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((r) => r.collection);
}

/** `null` when missing or not owned; pages call `notFound()`. */
export async function getMyCollection(userId: string, id: string) {
  return prisma.collection.findFirst({
    where: { id, userId },
    include: {
      categories: { select: categorySelect },
      items: {
        orderBy: { position: "asc" },
        include: { link: { include: { categories: { select: categorySelect } } } },
      },
    },
  });
}
