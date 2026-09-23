/**
 * Central place to read/validate server-side env vars.
 * Import this instead of reaching for `process.env` directly in controllers/routers.
 */
export const env = {
  databaseUrl: process.env.DATABASE_URL ?? "",
  nodeEnv: process.env.NODE_ENV ?? "development",
};
