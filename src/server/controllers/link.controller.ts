import { Prisma, type Collection, type CollectionItem } from "@prisma/client";
import { prisma, TX_OPTIONS } from "@/config/db";
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
