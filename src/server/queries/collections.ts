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
