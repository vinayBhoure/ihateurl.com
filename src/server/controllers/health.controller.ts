import { prisma } from "@/config/db";
import { env } from "@/config/env";
import type { PingInput } from "@/lib/validations/ping";

export type HealthResult =
  | {
      ok: true;
      provider: string;
      latencyMs: number;
      record: { id: string; message: string; createdAt: Date };
    }
  | { ok: false; provider: string; error: string };

/**
 * Writes then reads back an example `Ping` row/document to confirm DATABASE_URL
 * is reachable, regardless of whether it points at Postgres or MongoDB.
 */
export async function checkDatabaseConnection(
  input: PingInput
): Promise<HealthResult> {
  const start = Date.now();
  try {
    const record = await prisma.ping.create({ data: { message: input.message } });
    return {
      ok: true,
      provider: env.databaseProvider,
      latencyMs: Date.now() - start,
      record,
    };
  } catch (error) {
    return {
      ok: false,
      provider: env.databaseProvider,
      error: error instanceof Error ? error.message : "Unknown database error",
    };
  }
}
