/**
 * Central place to read/validate server-side env vars.
 * Import this instead of reaching for `process.env` directly in controllers/routers.
 */
function resolveAppUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.NODE_ENV !== "production") {
    return "http://localhost:3000";
  }
  throw new Error(
    "NEXT_PUBLIC_APP_URL is not set for this production build, and no VERCEL_PROJECT_PRODUCTION_URL fallback is available. Set NEXT_PUBLIC_APP_URL in the Vercel Production environment and redeploy.",
  );
}

export const env = {
  databaseUrl: process.env.DATABASE_URL ?? "",
  nodeEnv: process.env.NODE_ENV ?? "development",
  appUrl: resolveAppUrl(),
};
