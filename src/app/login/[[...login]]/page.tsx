import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";
import { Wordmark } from "@/components/wordmark";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <main id="main" className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-12">
      <Wordmark href="/" className="text-xl" />
      <SignIn path="/login" />
    </main>
  );
}
