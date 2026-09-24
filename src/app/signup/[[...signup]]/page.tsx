import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";
import { Wordmark } from "@/components/wordmark";

export const metadata: Metadata = { title: "Sign up" };

export default function SignUpPage() {
  return (
    <main id="main" className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-12">
      <Wordmark href="/" className="text-xl" />
      <SignUp path="/signup" />
    </main>
  );
}
