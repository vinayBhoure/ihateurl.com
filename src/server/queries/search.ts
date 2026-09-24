import { prisma } from "@/config/db";
import { escapeLike, searchQuerySchema } from "@/lib/validations/search";

const LIMIT = 20;

/** Case-insensitive `contains` on the user's own data. Invalid `q` → empty result. */
export async function searchMine(userId: string, q: string) {
  const parsed = searchQuerySchema.safeParse(q);
  if (!parsed.success) return { collections: [], links: [] };

  const match = { contains: escapeLike(parsed.data), mode: "insensitive" as const };
  const categoryMatch = { some: { category: { name: match } } };

  const [collections, links] = await Promise.all([
    prisma.collection.findMany({
      where: {
        userId,
        OR: [{ title: match }, { description: match }, { categories: categoryMatch }],
      },
      select: {
        id: true,
        title: true,
        slug: true,
        visibility: true,
        updatedAt: true,
        _count: { select: { items: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: LIMIT,
    }),
    prisma.link.findMany({
      where: {
        userId,
        OR: [{ title: match }, { domain: match }, { categories: categoryMatch }],
      },
      select: {
        id: true,
        url: true,
        title: true,
        domain: true,
        faviconUrl: true,
        updatedAt: true,
        collections: { select: { collection: { select: { id: true, title: true, slug: true } } } },
      },
      orderBy: { updatedAt: "desc" },
      take: LIMIT,
    }),
  ]);

  return {
    collections,
    links: links.map(({ collections: items, ...link }) => ({
      ...link,
      collections: items.map((i) => i.collection),
    })),
  };
}
