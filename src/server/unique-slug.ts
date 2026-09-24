import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/config/db";
import { SLUG_MAX_LENGTH } from "@/lib/slug";

type Db = PrismaClient | Prisma.TransactionClient;

/** P2 / I5: returns `base`, or `base-2`, `base-3`, … if taken by this user. */
export async function uniqueSlug(userId: string, base: string, db: Db = prisma): Promise<string> {
  // Suffixes cut into `base` when it is near the length cap, so match on a shorter prefix.
  const prefix = base.slice(0, SLUG_MAX_LENGTH - 10);
  const rows = await db.collection.findMany({
    where: { userId, slug: { startsWith: prefix } },
    select: { slug: true },
  });
  const taken = new Set(rows.map((r) => r.slug));
  if (!taken.has(base)) return base;

  for (let n = 2; ; n++) {
    const suffix = `-${n}`;
    const candidate = `${base.slice(0, SLUG_MAX_LENGTH - suffix.length).replace(/-+$/, "")}${suffix}`;
    if (!taken.has(candidate)) return candidate;
  }
}
