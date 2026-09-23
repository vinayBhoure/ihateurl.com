import { prisma } from "@/config/db";

export type HealthResult = { ok: true } | { ok: false };

export async function checkDatabaseConnection(): Promise<HealthResult> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { ok: true };
  } catch (error) {
    console.error("[health] database check failed", error);
    return { ok: false };
  }
}
