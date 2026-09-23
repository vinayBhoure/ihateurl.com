#!/usr/bin/env node
/**
 * Copies the correct Prisma schema (postgresql or mongodb) to prisma/schema.prisma
 * based on DATABASE_PROVIDER in .env, then runs `prisma generate`.
 *
 * Runs automatically on `npm install` (postinstall), `npm run dev`, and `npm run build`,
 * so switching DATABASE_PROVIDER in .env and re-running one of those is all you need.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

dotenv.config({ path: path.join(root, ".env") });

const VALID_PROVIDERS = ["postgresql", "mongodb"];
const provider = (process.env.DATABASE_PROVIDER || "postgresql").trim().toLowerCase();

if (!VALID_PROVIDERS.includes(provider)) {
  console.error(
    `[db:switch] Invalid DATABASE_PROVIDER "${provider}". Use "postgresql" or "mongodb" in your .env file.`
  );
  process.exit(1);
}

const source = path.join(root, "prisma", `schema.${provider}.prisma`);
const dest = path.join(root, "prisma", "schema.prisma");

fs.copyFileSync(source, dest);
console.log(`[db:switch] DATABASE_PROVIDER="${provider}" -> prisma/schema.prisma updated.`);

try {
  execSync("npx prisma generate", { stdio: "inherit", cwd: root });
} catch {
  console.error("[db:switch] `prisma generate` failed. Check your schema and DATABASE_URL.");
  process.exit(1);
}
