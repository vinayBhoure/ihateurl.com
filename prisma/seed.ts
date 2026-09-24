import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SYSTEM_CATEGORIES = [
  "Technology",
  "Design",
  "Business",
  "Learning",
  "Productivity",
  "Science",
  "Finance",
  "Health",
  "Entertainment",
  "News",
];

async function main() {
  // Postgres treats NULL userIds as distinct in @@unique([userId, slug]),
  // so system rows are matched by slug with an explicit userId: null lookup.
  await prisma.$transaction(
    async (tx) => {
      const existing = await tx.category.findMany({ where: { userId: null } });
      const bySlug = new Map(existing.map((c) => [c.slug, c]));

      const missing = SYSTEM_CATEGORIES.filter((name) => !bySlug.has(name.toLowerCase()));
      if (missing.length > 0) {
        await tx.category.createMany({
          data: missing.map((name) => ({ name, slug: name.toLowerCase(), userId: null })),
        });
      }

      for (const name of SYSTEM_CATEGORIES) {
        const row = bySlug.get(name.toLowerCase());
        if (row && row.name !== name) {
          await tx.category.update({ where: { id: row.id }, data: { name } });
        }
      }
    },
    { timeout: 30_000 }
  );

  const count = await prisma.category.count({ where: { userId: null } });
  console.log(`[seed] system categories: ${count}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
