import { prisma } from "@/config/db";

export async function listCategories(userId: string) {
  return prisma.category.findMany({
    where: { OR: [{ userId: null }, { userId }] },
    select: { id: true, name: true, slug: true, userId: true },
    orderBy: { name: "asc" },
  });
}
