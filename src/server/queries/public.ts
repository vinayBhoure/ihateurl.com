import { prisma } from "@/config/db";
import { buildUrl } from "@/lib/social-platforms";
import { escapeLike, searchQuerySchema } from "@/lib/validations/search";

// Every public read filters `visibility: PUBLIC` and selects fields explicitly, so
// private data and `clerkId` never leave this file.

const PAGE_SIZE = 20;

const ownerSelect = {
  username: true,
  displayName: true,
  avatarUrl: true,
} as const;

const categorySelect = { category: { select: { name: true, slug: true } } } as const;

/**
 * `null` only when the user doesn't exist; a user without public collections gets an empty list.
 * Social links come back as built URLs only (plan 7), never the raw stored value.
 */
export async function getPublicProfile(username: string) {
  const user = await prisma.user.findUnique({
    where: { username: username.toLowerCase() },
    select: {
      ...ownerSelect,
      bio: true,
      socialLinks: { select: { platform: true, value: true }, orderBy: { position: "asc" } },
      collections: {
        where: { visibility: "PUBLIC" },
        select: {
          title: true,
          slug: true,
          publicId: true,
          description: true,
          updatedAt: true,
          _count: { select: { items: true } },
        },
        orderBy: { updatedAt: "desc" },
      },
    },
  });
  if (!user) return null;

  const { socialLinks, ...profile } = user;
  return {
    ...profile,
    socialLinks: socialLinks.map(({ platform, value }) => ({
      platform,
      url: buildUrl(platform, value),
    })),
  };
}

/**
 * `null` when missing or not PUBLIC, so a private collection's existence isn't revealed.
 * C3.1: looked up by `publicId` alone — the page compares `user.username`/`slug` against the
 * URL and issues a `permanentRedirect` if either is stale (rename or slug change).
 */
export async function getPublicCollectionByPublicId(publicId: string) {
  return prisma.collection.findFirst({
    where: { publicId, visibility: "PUBLIC" },
    select: {
      id: true,
      title: true,
      slug: true,
      publicId: true,
      description: true,
      updatedAt: true,
      allowCopy: true,
      user: { select: ownerSelect },
      categories: { select: categorySelect },
      _count: { select: { items: true } },
      items: {
        orderBy: { position: "asc" },
        select: {
          id: true,
          link: {
            select: {
              url: true,
              title: true,
              description: true,
              domain: true,
              faviconUrl: true,
              imageUrl: true,
            },
          },
        },
      },
    },
  });
}

/** Explore. `q` matches collection title/description, link title/domain and category name. */
export async function searchPublic({
  q,
  categorySlug,
  page = 1,
}: {
  q?: string;
  categorySlug?: string;
  page?: number;
}) {
  const parsedQ = searchQuerySchema.safeParse(q ?? "");
  const match = parsedQ.success
    ? { contains: escapeLike(parsedQ.data), mode: "insensitive" as const }
    : undefined;
  const currentPage = Number.isInteger(page) && page > 0 ? page : 1;

  const rows = await prisma.collection.findMany({
    where: {
      visibility: "PUBLIC",
      ...(categorySlug && {
        categories: { some: { category: { slug: categorySlug, userId: null } } },
      }),
      ...(match && {
        OR: [
          { title: match },
          { description: match },
          { items: { some: { link: { OR: [{ title: match }, { domain: match }] } } } },
          { categories: { some: { category: { name: match } } } },
        ],
      }),
    },
    select: {
      title: true,
      slug: true,
      publicId: true,
      description: true,
      updatedAt: true,
      user: { select: ownerSelect },
      _count: { select: { items: true } },
    },
    orderBy: { updatedAt: "desc" },
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE + 1,
  });

  return {
    results: rows.slice(0, PAGE_SIZE),
    page: currentPage,
    hasNext: rows.length > PAGE_SIZE,
  };
}

export type PublicSuggestion = { title: string; username: string; url: string };

const SUGGEST_MIN_CHARS = 2;
const SUGGEST_LIMIT = 5;

/** C3.4: top 5 public collections matching `q`, for /explore's suggestion dropdown. */
export async function suggestPublic(q: string): Promise<PublicSuggestion[]> {
  const trimmed = q.trim();
  if (trimmed.length < SUGGEST_MIN_CHARS) return [];
  const parsedQ = searchQuerySchema.safeParse(trimmed);
  if (!parsedQ.success) return [];

  const match = { contains: escapeLike(parsedQ.data), mode: "insensitive" as const };
  const rows = await prisma.collection.findMany({
    where: {
      visibility: "PUBLIC",
      OR: [
        { title: match },
        { description: match },
        { items: { some: { link: { OR: [{ title: match }, { domain: match }] } } } },
        { categories: { some: { category: { name: match } } } },
      ],
    },
    select: { title: true, slug: true, publicId: true, user: { select: { username: true } } },
    orderBy: { updatedAt: "desc" },
    take: SUGGEST_LIMIT,
  });

  return rows.map((r) => ({
    title: r.title,
    username: r.user.username,
    url: `/u/${r.user.username}/${r.slug}/${r.publicId}`,
  }));
}

/** P7: explore filter lists system categories only. */
export async function listSystemCategories() {
  return prisma.category.findMany({
    where: { userId: null },
    select: { name: true, slug: true },
    orderBy: { name: "asc" },
  });
}

/** Profiles with ≥ 1 public collection (lastModified = newest public collection) + public collections. */
export async function getSitemapEntries() {
  const collections = await prisma.collection.findMany({
    where: { visibility: "PUBLIC" },
    select: { slug: true, publicId: true, updatedAt: true, user: { select: { username: true } } },
    orderBy: { updatedAt: "desc" },
  });

  const profiles = new Map<string, Date>();
  for (const c of collections) {
    if (!profiles.has(c.user.username)) profiles.set(c.user.username, c.updatedAt);
  }

  return {
    profiles: [...profiles].map(([username, updatedAt]) => ({ username, updatedAt })),
    collections: collections.map((c) => ({
      username: c.user.username,
      slug: c.slug,
      publicId: c.publicId,
      updatedAt: c.updatedAt,
    })),
  };
}
