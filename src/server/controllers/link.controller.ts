import { Prisma, type Collection, type CollectionItem } from "@prisma/client";
import { prisma, TX_OPTIONS } from "@/config/db";
import type { UpdateLinkInput } from "@/lib/validations/link";
import { assertAttachableCategories } from "@/server/controllers/category.controller";
import { getOwnedCollection } from "@/server/controllers/collection.controller";
import { getMetadata } from "@/server/metadata/parse";
import { AppError } from "@/server/result";

const ALREADY_IN_COLLECTION = "Already in this collection";

type Tx = Prisma.TransactionClient;

function isUniqueViolation(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";
}

async function nextPosition(tx: Tx, collectionId: string): Promise<number> {
  const { _max } = await tx.collectionItem.aggregate({
    where: { collectionId },
    _max: { position: true },
  });
  return (_max.position ?? -1) + 1;
}

async function addExistingLink(
  collectionId: string,
  linkId: string
): Promise<CollectionItem> {
  try {
    return await prisma.$transaction(async (tx) => {
      const inCollection = await tx.collectionItem.findUnique({
        where: { collectionId_linkId: { collectionId, linkId } },
        select: { id: true },
      });
      if (inCollection) {
        throw new AppError("CONFLICT", ALREADY_IN_COLLECTION, { url: [ALREADY_IN_COLLECTION] });
      }
      const position = await nextPosition(tx, collectionId);
      return tx.collectionItem.create({ data: { collectionId, linkId, position } });
    }, TX_OPTIONS);
  } catch (err) {
    if (isUniqueViolation(err)) {
      throw new AppError("CONFLICT", ALREADY_IN_COLLECTION, { url: [ALREADY_IN_COLLECTION] });
    }
    throw err;
  }
}

/**
 * I1/I3: one Link per (user, normalizedUrl); a link appears once per collection.
 * Existing links are attached without refetching; new ones get metadata first,
 * outside the transaction, so a slow site never holds it open.
 */
export async function createLink(
  userId: string,
  collectionId: string,
  url: string,
  normalizedUrl: string
): Promise<{ item: CollectionItem; created: boolean; collection: Collection }> {
  const collection = await getOwnedCollection(userId, collectionId);

  const existing = await prisma.link.findUnique({
    where: { userId_normalizedUrl: { userId, normalizedUrl } },
    select: { id: true },
  });
  if (existing) {
    return { item: await addExistingLink(collectionId, existing.id), created: false, collection };
  }

  const meta = await getMetadata(normalizedUrl);
  try {
    const item = await prisma.$transaction(async (tx) => {
      const link = await tx.link.create({
        data: {
          userId,
          url,
          normalizedUrl,
          domain: meta.domain,
          title: meta.title ?? meta.domain,
          description: meta.description,
          faviconUrl: meta.faviconUrl,
          imageUrl: meta.imageUrl,
        },
      });
      const position = await nextPosition(tx, collectionId);
      return tx.collectionItem.create({ data: { collectionId, linkId: link.id, position } });
    }, TX_OPTIONS);
    return { item, created: true, collection };
  } catch (err) {
    if (!isUniqueViolation(err)) throw err;
    // A concurrent save created the same link first: attach that one instead.
    const raced = await prisma.link.findUnique({
      where: { userId_normalizedUrl: { userId, normalizedUrl } },
      select: { id: true },
    });
    if (!raced) throw err;
    return { item: await addExistingLink(collectionId, raced.id), created: false, collection };
  }
}

type CollectionRef = { id: string; slug: string };

async function getOwnedLink(userId: string, id: string) {
  const link = await prisma.link.findFirst({
    where: { id, userId },
    include: { collections: { select: { collection: { select: { id: true, slug: true } } } } },
  });
  if (!link) throw new AppError("NOT_FOUND");
  return { link, collections: link.collections.map((i) => i.collection) };
}

async function getOwnedItem(userId: string, itemId: string) {
  const item = await prisma.collectionItem.findFirst({
    where: { id: itemId, collection: { userId } },
    include: { collection: { select: { id: true, slug: true } } },
  });
  if (!item) throw new AppError("NOT_FOUND");
  return item;
}

/** D5: a link is shared, so edits show in every collection holding it. */
export async function updateLink(
  userId: string,
  input: UpdateLinkInput
): Promise<CollectionRef[]> {
  const { collections } = await getOwnedLink(userId, input.id);
  const { id, categoryIds, ...fields } = input;
  if (categoryIds) await assertAttachableCategories(userId, categoryIds);

  await prisma.$transaction(async (tx) => {
    if (categoryIds) {
      await tx.linkCategory.deleteMany({ where: { linkId: id } });
      if (categoryIds.length > 0) {
        await tx.linkCategory.createMany({
          data: categoryIds.map((categoryId) => ({ linkId: id, categoryId })),
        });
      }
    }
    await tx.link.update({ where: { id }, data: { ...fields, updatedAt: new Date() } });
  }, TX_OPTIONS);
  return collections;
}

/** Items and category joins cascade. */
export async function deleteLink(userId: string, id: string): Promise<CollectionRef[]> {
  const { collections } = await getOwnedLink(userId, id);
  await prisma.link.delete({ where: { id } });
  return collections;
}

/** D4 / I2: removing the last item deletes the link in the same transaction. */
export async function removeLinkFromCollection(
  userId: string,
  itemId: string
): Promise<{ collection: CollectionRef; linkDeleted: boolean }> {
  const item = await getOwnedItem(userId, itemId);
  const linkDeleted = await prisma.$transaction(async (tx) => {
    await tx.collectionItem.delete({ where: { id: item.id } });
    const { count } = await tx.link.deleteMany({
      where: { id: item.linkId, collections: { none: {} } },
    });
    return count > 0;
  }, TX_OPTIONS);
  return { collection: item.collection, linkDeleted };
}

/** If the link is already in the target, the source item is dropped (I3). */
export async function moveLink(
  userId: string,
  itemId: string,
  targetCollectionId: string
): Promise<{ source: CollectionRef; target: CollectionRef }> {
  const item = await getOwnedItem(userId, itemId);
  const target = await getOwnedCollection(userId, targetCollectionId);
  const refs = { source: item.collection, target: { id: target.id, slug: target.slug } };
  if (target.id === item.collectionId) return refs;

  await prisma.$transaction(async (tx) => {
    const inTarget = await tx.collectionItem.findUnique({
      where: { collectionId_linkId: { collectionId: target.id, linkId: item.linkId } },
      select: { id: true },
    });
    if (inTarget) {
      await tx.collectionItem.delete({ where: { id: item.id } });
      return;
    }
    const position = await nextPosition(tx, target.id);
    await tx.collectionItem.update({
      where: { id: item.id },
      data: { collectionId: target.id, position },
    });
  }, TX_OPTIONS);
  return refs;
}

/** I4: `itemIds` must be exactly the collection's items; positions become 0..n-1. */
export async function reorderCollectionItems(
  userId: string,
  collectionId: string,
  itemIds: string[]
): Promise<CollectionRef> {
  const collection = await getOwnedCollection(userId, collectionId);
  const current = await prisma.collectionItem.findMany({
    where: { collectionId },
    select: { id: true },
  });
  const currentIds = new Set(current.map((i) => i.id));
  const sameSet =
    itemIds.length === currentIds.size &&
    new Set(itemIds).size === itemIds.length &&
    itemIds.every((itemId) => currentIds.has(itemId));
  if (!sameSet) {
    const message = "The list changed. Refresh and try again.";
    throw new AppError("VALIDATION", message, { itemIds: [message] });
  }

  await prisma.$transaction(
    itemIds.map((itemId, index) =>
      prisma.collectionItem.update({ where: { id: itemId }, data: { position: index } })
    )
  );
  return { id: collection.id, slug: collection.slug };
}
