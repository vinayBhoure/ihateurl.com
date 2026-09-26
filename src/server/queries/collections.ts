import { prisma } from "@/config/db";

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

/** Plan 8 E2: which of `sourceIds` the viewer has already saved (copied), for the card bookmark. */
export async function listSavedSourceIds(userId: string, sourceIds: string[]): Promise<Set<string>> {
  if (sourceIds.length === 0) return new Set();
  const copies = await prisma.collection.findMany({
    where: { userId, sourceCollectionId: { in: sourceIds } },
    select: { sourceCollectionId: true },
  });
  return new Set(copies.flatMap((c) => (c.sourceCollectionId ? [c.sourceCollectionId] : [])));
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
