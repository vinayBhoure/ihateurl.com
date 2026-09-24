import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { OnboardingForm } from "@/components/onboarding-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Wordmark } from "@/components/wordmark";
import { getCurrentUser } from "@/server/auth/current-user";

export const metadata: Metadata = { title: "Set up your profile", robots: { index: false } };

/** First sign-in (flow 4.1). Outside the app shell so the shell's redirect can't loop. */
export default async function OnboardingPage() {
  await auth.protect();
  if (await getCurrentUser()) redirect("/app");

  const clerkUser = await currentUser();
  const displayName = clerkUser?.fullName?.trim() || clerkUser?.firstName?.trim() || "";
  const initial = (displayName || "?").charAt(0).toUpperCase();

  return (
    <main id="main" className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-12">
      <Wordmark href="/" className="text-xl" />
      <Card className="w-full max-w-md space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Avatar size="lg">
            {clerkUser?.imageUrl && <AvatarImage src={clerkUser.imageUrl} alt="" />}
            <AvatarFallback>{initial}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-[-0.015em]">Set up your profile</h1>
            <p className="text-sm text-muted-foreground">
              Your username is the address of your public page.
            </p>
          </div>
        </div>
        <OnboardingForm defaultDisplayName={displayName} />
      </Card>
    </main>
  );
}
