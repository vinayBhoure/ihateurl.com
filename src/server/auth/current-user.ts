import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import type { User } from "@prisma/client";
import { prisma } from "@/config/db";
import { AppError } from "@/server/result";

/** Memoized per request, so the shell layout and its page share one query. */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const { userId } = await auth();
  if (!userId) return null;
  return prisma.user.findUnique({ where: { clerkId: userId } });
});

/** Signed-out: pages redirect to /login, server actions get a 401. */
export async function requireUser(): Promise<string> {
  const { userId } = await auth.protect();
  return userId;
}

/** App-shell pages and layout: signed out → /login (Clerk), no DB user yet → /app/onboarding. */
export async function requirePageUser(): Promise<User> {
  await auth.protect();
  const user = await getCurrentUser();
  if (!user) redirect("/app/onboarding");
  return user;
}

export async function requireOnboardedUser(): Promise<User> {
  const clerkId = await requireUser();
  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) throw new AppError("NOT_ONBOARDED");
  return user;
}
