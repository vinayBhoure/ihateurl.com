import type { Collection } from "@prisma/client";
import { prisma, TX_OPTIONS } from "@/config/db";
import { AppError } from "@/server/result";
import { uniqueSlug } from "@/server/unique-slug";

const systemCategory = { where: { category: { userId: null } }, select: { categoryId: true } } as const;

/**
 * P4: only another user's PUBLIC collection; the copy starts PRIVATE; URLs the user
 * already saved are reused (I1); new links copy metadata without refetching; only
 * system categories are copied. Batched so the transaction is a fixed number of
 * round trips regardless of item count.
 */
export async function copyCollection(userId: string, sourceCollectionId: string): Promise<Collection> {
  const source = await prisma.collection.findFirst({
    where: { id: sourceCollectionId, visibility: "PUBLIC", userId: { not: userId } },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      categories: systemCategory,
      items: {
        orderBy: { position: "asc" },
        select: {
          link: {
            select: {
              url: true,
              normalizedUrl: true,
              title: true,
              description: true,
              domain: true,
              faviconUrl: true,
              imageUrl: true,
              categories: systemCategory,
            },
          },
        },
      },
    },
  });
  if (!source) throw new AppError("NOT_FOUND");

  const sourceLinks = source.items.map((i) => i.link);
  const urls = sourceLinks.map((l) => l.normalizedUrl);
  const alreadySaved = new Set(
    (
      await prisma.link.findMany({
        where: { userId, normalizedUrl: { in: urls } },
        select: { normalizedUrl: true },
      })
    ).map((l) => l.normalizedUrl)
  );
  const toCreate = sourceLinks.filter((l) => !alreadySaved.has(l.normalizedUrl));
  const slug = await uniqueSlug(userId, source.slug);

  return prisma.$transaction(async (tx) => {
    const copy = await tx.collection.create({
      data: {
        userId,
        title: source.title,
        slug,
        description: source.description,
        visibility: "PRIVATE",
        sourceCollectionId: source.id,
        copiedAt: new Date(),
        categories: { createMany: { data: source.categories } },
      },
    });

    if (toCreate.length > 0) {
      await tx.link.createMany({
        data: toCreate.map((l) => ({
          userId,
          url: l.url,
          normalizedUrl: l.normalizedUrl,
          title: l.title,
          description: l.description,
          domain: l.domain,
          faviconUrl: l.faviconUrl,
          imageUrl: l.imageUrl,
        })),
        skipDuplicates: true,
      });
    }

    const userLinks = await tx.link.findMany({
      where: { userId, normalizedUrl: { in: urls } },
      select: { id: true, normalizedUrl: true },
    });
    const idByUrl = new Map(userLinks.map((l) => [l.normalizedUrl, l.id]));

    const newLinkCategories = toCreate.flatMap((l) =>
      l.categories.map((c) => ({ linkId: idByUrl.get(l.normalizedUrl)!, categoryId: c.categoryId }))
    );
    if (newLinkCategories.length > 0) {
      await tx.linkCategory.createMany({ data: newLinkCategories, skipDuplicates: true });
    }

    if (urls.length > 0) {
      await tx.collectionItem.createMany({
        data: urls.map((url, position) => ({
          collectionId: copy.id,
          linkId: idByUrl.get(url)!,
          position,
        })),
      });
    }
    return copy;
  }, TX_OPTIONS);
}
