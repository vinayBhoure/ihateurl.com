import type { Prisma, PrismaClient } from "@prisma/client";
import { randomBytes } from "crypto";
import { prisma } from "@/config/db";

type Db = PrismaClient | Prisma.TransactionClient;

const PUBLIC_ID_LENGTH = 6;
const PUBLIC_ID_ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";
const MAX_ATTEMPTS = 5;

function randomPublicId(): string {
  const bytes = randomBytes(PUBLIC_ID_LENGTH);
  let id = "";
  for (let i = 0; i < PUBLIC_ID_LENGTH; i++) id += PUBLIC_ID_ALPHABET[bytes[i] % PUBLIC_ID_ALPHABET.length];
  return id;
}

/** C3.1: 6-char [a-z0-9] id, fixed for the collection's lifetime, unique across all collections. */
export async function uniquePublicId(db: Db = prisma): Promise<string> {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const id = randomPublicId();
    const taken = await db.collection.findUnique({ where: { publicId: id }, select: { id: true } });
    if (!taken) return id;
  }
  throw new Error("Could not generate a unique collection publicId after 5 attempts.");
}
