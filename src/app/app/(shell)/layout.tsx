import type { Metadata } from "next";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { AppHeader } from "@/components/app-header";
import { SkipLink } from "@/components/skip-link";
import { getCurrentUser } from "@/server/auth/current-user";

export const metadata: Metadata = { robots: { index: false } };

/**
 * FP4: signed-in area. Signed out → /login (Clerk); no DB user yet → /app/onboarding,
 * which sits outside this group so it can't loop. Pages still check auth themselves.
 */
export default async function ShellLayout({ children }: { children: ReactNode }) {
  await auth.protect();
  const user = await getCurrentUser();
  if (!user) redirect("/app/onboarding");

  return (
    <>
      <SkipLink />
      <AppHeader />
      <main id="main" className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 md:px-6">
        {children}
      </main>
    </>
  );
}
