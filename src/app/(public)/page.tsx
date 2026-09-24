import type { ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Show } from "@clerk/nextjs";
import { OrganizeCrop, ProductFrame, SaveCrop, ShareCrop } from "@/components/landing-product-frame";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Title and description come from the root layout.
export const metadata: Metadata = { alternates: { canonical: "/" } };

const STEPS: { title: string; text: string; crop: ReactNode }[] = [
  { title: "Save", text: "Paste a URL. The title, description and icon are filled in for you.", crop: <SaveCrop /> },
  {
    title: "Organize",
    text: "Group links into collections, tag them and put them in order. One link can live in several collections.",
    crop: <OrganizeCrop />,
  },
  {
    title: "Share",
    text: "Make a collection public and send one link. Anyone can open it without an account.",
    crop: <ShareCrop />,
  },
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

      <section aria-labelledby="how-heading" className="border-t">
        <div className="mx-auto w-full max-w-5xl space-y-12 px-4 py-16 md:space-y-16 md:px-6 md:py-24">
          <h2 id="how-heading" className="text-xl font-semibold">
            How it works
          </h2>
          {/* Text and crop alternate sides from 768 px; stacked, text first, below. */}
          {STEPS.map(({ title, text, crop }, index) => (
            <div key={title} className="grid grid-cols-1 items-center gap-6 md:grid-cols-2 md:gap-12">
              <div className={cn("space-y-2", index % 2 === 1 && "md:order-last")}>
                <h3 className="font-semibold">{title}</h3>
                <p className="text-muted-foreground">{text}</p>
              </div>
              {crop}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
