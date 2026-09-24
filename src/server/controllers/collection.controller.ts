import { Prisma, type Collection } from "@prisma/client";
import { prisma } from "@/config/db";
import { slugify } from "@/lib/slug";
import type { UpdateCollectionInput } from "@/lib/validations/collection";
import { assertAttachableCategories } from "@/server/controllers/category.controller";
import { AppError } from "@/server/result";
import { uniqueSlug } from "@/server/unique-slug";

const SLUG_TAKEN = "You already have a collection at that URL.";
/** Interactive transactions make several round trips; Prisma's 5 s default is tight on a remote DB. */
const TX_OPTIONS = { timeout: 15_000 };

function isUniqueViolation(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";
}

export async function getOwnedCollection(userId: string, id: string): Promise<Collection> {
  const collection = await prisma.collection.findFirst({ where: { id, userId } });
  if (!collection) throw new AppError("NOT_FOUND");
  return collection;
}

export async function createCollection(
  userId: string,
  data: { title: string; description?: string }
): Promise<Collection> {
  const base = slugify(data.title);
  // Retry covers a concurrent create taking the same slug between check and insert.
  for (let attempt = 0; ; attempt++) {
    const slug = await uniqueSlug(userId, base);
    try {
      return await prisma.collection.create({ data: { userId, ...data, slug } });
    } catch (err) {
      if (!isUniqueViolation(err) || attempt >= 2) throw err;
    }
  }
}

export async function updateCollection(
  userId: string,
  input: UpdateCollectionInput
): Promise<{ before: Collection; after: Collection }> {
  const before = await getOwnedCollection(userId, input.id);
  const { id, categoryIds, ...fields } = input;

  if (categoryIds) await assertAttachableCategories(userId, categoryIds);

  try {
    const after = await prisma.$transaction(async (tx) => {
      if (categoryIds) {
        await tx.collectionCategory.deleteMany({ where: { collectionId: id } });
        if (categoryIds.length > 0) {
          await tx.collectionCategory.createMany({
            data: categoryIds.map((categoryId) => ({ collectionId: id, categoryId })),
          });
        }
      }
      // Explicit updatedAt so a categories-only change still bumps it.
      return tx.collection.update({ where: { id }, data: { ...fields, updatedAt: new Date() } });
    }, TX_OPTIONS);
    return { before, after };
  } catch (err) {
    if (isUniqueViolation(err)) throw new AppError("CONFLICT", SLUG_TAKEN, { slug: [SLUG_TAKEN] });
    throw err;
  }
}

/** I2: links left with zero items after the delete are removed in the same transaction. */
export async function deleteCollection(userId: string, id: string): Promise<Collection> {
  const collection = await getOwnedCollection(userId, id);
  await prisma.$transaction(async (tx) => {
    const items = await tx.collectionItem.findMany({
      where: { collectionId: id },
      select: { linkId: true },
    });
    await tx.collection.delete({ where: { id } });
    if (items.length > 0) {
      await tx.link.deleteMany({
        where: { userId, id: { in: items.map((i) => i.linkId) }, collections: { none: {} } },
      });
    }
  }, TX_OPTIONS);
  return collection;
}
