import { AppError } from "@/server/result";

/** P3. Per server instance only (D9): limits reset on restart or across instances. */
export const RATE_LIMITS = {
  createLink: { limit: 30, windowMs: 60_000 },
  copyCollection: { limit: 10, windowMs: 60_000 },
  exploreSuggest: { limit: 20, windowMs: 60_000 },
} as const;

const hits = new Map<string, number[]>();

/** Sliding window. Throws `AppError("RATE_LIMITED")` once `limit` calls fall inside `windowMs`. */
export function rateLimit(key: string, limit: number, windowMs: number): void {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    throw new AppError("RATE_LIMITED");
  }
  recent.push(now);
  hits.set(key, recent);
}
