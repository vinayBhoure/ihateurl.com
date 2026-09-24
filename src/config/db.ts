import { PrismaClient } from "@prisma/client";

/**
 * Prisma client singleton.
 * Prevents exhausting DB connections from hot-reloaded modules in development.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/** Interactive transactions make several round trips; Prisma's 5 s default is tight on a remote DB. */
export const TX_OPTIONS = { timeout: 15_000 };
