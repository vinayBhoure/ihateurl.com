import { z } from "zod";

export const searchQuerySchema = z.string().trim().min(1).max(100);

/** Prisma `contains` maps to ILIKE without escaping, so `%` / `_` would act as wildcards. */
export function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, "\\$&");
}
