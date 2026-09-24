import { auth } from "@clerk/nextjs/server";
import type { User } from "@prisma/client";
import { prisma } from "@/config/db";
import { AppError } from "@/server/result";

export async function getCurrentUser(): Promise<User | null> {
  const { userId } = await auth();
  if (!userId) return null;
  return prisma.user.findUnique({ where: { clerkId: userId } });
}

/** Signed-out: pages redirect to /login, server actions get a 401. */
export async function requireUser(): Promise<string> {
  const { userId } = await auth.protect();
  return userId;
}

export async function requireOnboardedUser(): Promise<User> {
  const clerkId = await requireUser();
  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) throw new AppError("NOT_ONBOARDED");
  return user;
}
