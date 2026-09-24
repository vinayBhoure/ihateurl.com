import type { Metadata } from "next";
import Link from "next/link";
import { FolderOpen, Link2, Share2, type LucideIcon } from "lucide-react";
import { Show } from "@clerk/nextjs";
import { ProductFrame } from "@/components/landing-product-frame";
import { Button } from "@/components/ui/button";

// Title and description come from the root layout.
export const metadata: Metadata = { alternates: { canonical: "/" } };

const STEPS: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Link2, title: "Save", text: "Paste a URL. The title, description and icon are filled in for you." },
  { icon: FolderOpen, title: "Organize", text: "Group links into collections and tag them with categories. Everything starts private." },
  { icon: Share2, title: "Share", text: "Publish a collection at ihateurl.com/you/collection and send the link." },
];

export default function LandingPage() {
  return (
    <>
      <section className="mx-auto w-full max-w-5xl px-4 pt-16 md:px-6 md:pt-24">
        <div className="mx-auto max-w-2xl space-y-6 text-center">
          <h1 className="text-4xl font-semibold tracking-[-0.025em] text-balance md:text-5xl">
            One link for every list of links.
          </h1>
          <p className="text-lg text-balance text-muted-foreground">
            Save URLs into collections, keep them private, publish the ones you choose at{" "}
            <span className="font-mono text-base text-foreground">ihateurl.com/you/collection</span>.
          </p>
          <div className="space-y-4">
            <div className="flex flex-wrap justify-center gap-3">
              <Show when="signed-out">
                <Button asChild size="lg">
                  <Link href="/signup">Sign up</Link>
                </Button>
              </Show>
              <Show when="signed-in">
                <Button asChild size="lg">
                  <Link href="/app">Go to app</Link>
                </Button>
              </Show>
              <Button asChild size="lg" variant="outline">
                <Link href="/explore">Explore collections</Link>
              </Button>
            </div>
            <p className="text-sm text-balance text-muted-foreground">
              Free · Sign in with Google or GitHub · Collections start private
            </p>
          </div>
        </div>
      </section>

      {/* The preview straddles the top of a muted band: depth from tone, not shadow (LP2). */}
      <div className="relative mt-12 md:mt-16">
        <div aria-hidden className="absolute inset-x-0 top-1/2 bottom-0 border-t bg-muted/60" />
        <div className="relative mx-auto w-full max-w-5xl px-4 pb-16 md:px-6 md:pb-24">
          <ProductFrame />
        </div>
      </div>

      <section aria-label="How it works" className="border-t">
        <div className="mx-auto grid w-full max-w-5xl gap-10 px-4 py-16 md:grid-cols-3 md:gap-8 md:px-6 md:py-24">
          {STEPS.map(({ icon: Icon, title, text }) => (
            <div key={title} className="space-y-3">
              <div className="flex size-10 items-center justify-center rounded-lg border">
                <Icon aria-hidden className="size-4" />
              </div>
              <h2 className="text-xl font-semibold">{title}</h2>
              <p className="text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
