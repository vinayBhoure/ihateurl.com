import { prisma } from "@/config/db";
import { AppError } from "@/server/result";

/**
 * Plan 9 §2.2: a bookmark, nothing is copied. Only another user's PUBLIC collection with
 * `allowCopy` on (the column keeps its name; it now means "allow new saves"). Saving twice
 * keeps the first row.
 */
export async function saveCollection(userId: string, collectionId: string): Promise<void> {
  const collection = await prisma.collection.findFirst({
    where: { id: collectionId, visibility: "PUBLIC", allowCopy: true, userId: { not: userId } },
    select: { id: true },
  });
  if (!collection) throw new AppError("NOT_FOUND");

  await prisma.savedCollection.createMany({
    data: [{ userId, collectionId }],
    skipDuplicates: true,
  });
}

/** Works whatever the collection's visibility or `allowCopy` is now (plan 9 O4, O5). */
export async function unsaveCollection(userId: string, collectionId: string): Promise<void> {
  const { count } = await prisma.savedCollection.deleteMany({ where: { userId, collectionId } });
  if (count === 0) throw new AppError("NOT_FOUND");
}
