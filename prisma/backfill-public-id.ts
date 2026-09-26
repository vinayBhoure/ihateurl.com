// One-off (plan 6 C3.1): backfills Collection.publicId for rows created before it existed.
// Idempotent — only touches rows where publicId is still null. Run before the migration that
// makes the column required + unique; re-run if that migration fails on a missed row.
// Usage: npx tsx prisma/backfill-public-id.ts
import { PrismaClient } from "@prisma/client";
import { randomBytes } from "crypto";

const prisma = new PrismaClient();

const PUBLIC_ID_LENGTH = 6;
const PUBLIC_ID_ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";
const MAX_ATTEMPTS = 5;

function randomPublicId(): string {
  const bytes = randomBytes(PUBLIC_ID_LENGTH);
  let id = "";
  for (let i = 0; i < PUBLIC_ID_LENGTH; i++) id += PUBLIC_ID_ALPHABET[bytes[i] % PUBLIC_ID_ALPHABET.length];
  return id;
}

async function uniquePublicId(): Promise<string> {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const id = randomPublicId();
    // publicId has no unique constraint yet at this point in the migration, so findFirst.
    const taken = await prisma.collection.findFirst({ where: { publicId: id }, select: { id: true } });
    if (!taken) return id;
  }
  throw new Error("Could not generate a unique publicId after 5 attempts.");
}

async function main() {
  // @ts-expect-error -- this repo's schema.prisma already has `publicId` as required (post-migration),
  // but this script targets the intermediate state (deployed migration 1, migration 2 not yet run)
  // where the live column is still nullable. Filtering by null is valid there despite the type error here.
  const rows = await prisma.collection.findMany({ where: { publicId: null }, select: { id: true } });
  for (const row of rows) {
    const publicId = await uniquePublicId();
    await prisma.collection.update({ where: { id: row.id }, data: { publicId } });
  }
  console.log(`[backfill-public-id] updated ${rows.length} collection(s).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
