import { Prisma, type User } from "@prisma/client";
import { prisma } from "@/config/db";
import { AppError } from "@/server/result";

const USERNAME_TAKEN = "That username is taken.";
const ALREADY_ONBOARDED = "Your profile is already set up.";

export async function isUsernameTaken(username: string): Promise<boolean> {
  const row = await prisma.user.findUnique({ where: { username }, select: { id: true } });
  return row !== null;
}

export async function createUserProfile(data: {
  clerkId: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
}): Promise<User> {
  const existing = await prisma.user.findUnique({
    where: { clerkId: data.clerkId },
    select: { id: true },
  });
  if (existing) throw new AppError("CONFLICT", ALREADY_ONBOARDED);

  try {
    return await prisma.user.create({ data });
  } catch (err) {
    throwIfUniqueViolation(err, ALREADY_ONBOARDED);
    throw err;
  }
}

export async function updateUserProfile(
  userId: string,
  data: { username?: string; displayName?: string | null; bio?: string | null }
): Promise<User> {
  try {
    return await prisma.user.update({ where: { id: userId }, data });
  } catch (err) {
    throwIfUniqueViolation(err, USERNAME_TAKEN);
    throw err;
  }
}

/** C2.4: keeps the DB avatar in sync with Clerk's photo. Not user-facing, so no unique-violation handling needed. */
export async function syncAvatarUrl(userId: string, avatarUrl: string): Promise<void> {
  await prisma.user.update({ where: { id: userId }, data: { avatarUrl } });
}

function throwIfUniqueViolation(err: unknown, otherFieldMessage: string): void {
  if (!(err instanceof Prisma.PrismaClientKnownRequestError) || err.code !== "P2002") return;
  const target = err.meta?.target;
  const fields = Array.isArray(target) ? target : [String(target)];
  if (fields.includes("username")) {
    throw new AppError("CONFLICT", USERNAME_TAKEN, { username: [USERNAME_TAKEN] });
  }
  throw new AppError("CONFLICT", otherFieldMessage);
}
