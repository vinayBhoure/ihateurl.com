import type { ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Show } from "@clerk/nextjs";
import { LandingExplore } from "@/components/landing-explore";
import { LandingFaq } from "@/components/landing-faq";
import { OrganizeCrop, ProductFrame, SaveCrop, ShareCrop } from "@/components/landing-product-frame";
import { Button } from "@/components/ui/button";
import { UserBadgeScript } from "@/components/user-badge-script";
import { cn } from "@/lib/utils";
import { listSystemCategories, searchPublic } from "@/server/queries/public";

// Title and description come from the root layout.
export const metadata: Metadata = { alternates: { canonical: "/" } };

// Rendered per request (as sitemap.ts), so a collection made private leaves the strip at once (LP4).
export const dynamic = "force-dynamic";

const EXPLORE_MIN = 3; // strip hidden below this many public collections (LD4)
const EXPLORE_SHOW = 6;

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

// Each claim maps to a verified fact (plan 3 §1).
const PRIVACY: { title: string; text: string }[] = [
  { title: "Private by default.", text: "Every new collection starts private." },
  {
    title: "Never listed.",
    text: "Private collections don't appear on your profile, in Explore, in the sitemap or in search engines.",
  },
  {
    title: "Reversible.",
    text: "Make a public collection private again and it leaves Explore and the sitemap right away.",
  },
  { title: "No new password.", text: "Sign in with Google or GitHub." },
];

export default async function LandingPage() {
  const explore = await loadExplore();

  return (
    <>
      <UserBadgeScript />
      <section className="mx-auto w-full max-w-5xl px-4 pt-16 md:px-6 md:pt-24">
        <div className="mx-auto max-w-2xl space-y-6 text-center">
          <h1 className="text-4xl font-semibold tracking-[-0.025em] text-balance md:text-5xl">
            One link for every list of links.
          </h1>
          <p className="text-lg text-balance text-muted-foreground">
            Save URLs into collections, keep them private, publish the ones you choose at{" "}
            <span className="font-mono text-base text-foreground">ihateurl.com/u/you/collection</span>.
          </p>
          <div className="space-y-4">
            <CtaButtons />
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

      {explore && <LandingExplore categories={explore.categories} collections={explore.collections} />}

      <section aria-labelledby="privacy-heading" className="border-t">
        <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-16 md:px-6 md:py-24">
          <h2 id="privacy-heading" className="text-xl font-semibold">
            Private means private
          </h2>
          <dl className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
            {PRIVACY.map(({ title, text }) => (
              <div key={title} className="space-y-1">
                <dt className="font-semibold">{title}</dt>
                <dd className="text-muted-foreground">{text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section aria-labelledby="faq-heading" className="border-t">
        <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-16 md:px-6 md:py-24">
          <h2 id="faq-heading" className="text-xl font-semibold">
            Questions
          </h2>
          <LandingFaq />
        </div>
      </section>

      <section aria-labelledby="cta-heading" className="border-t bg-muted/60">
        <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-16 text-center md:px-6 md:py-24">
          <h2 id="cta-heading" className="text-xl font-semibold">
            Start your first collection.
          </h2>
          <CtaButtons />
        </div>
      </section>
    </>
  );
}

/** Primary action by auth state (Clerk `<Show>`) plus Explore; used in the hero and the closing band. */
function CtaButtons() {
  return (
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
  );
}

/**
 * System categories and the newest public collections, or `null` when there are fewer than
 * EXPLORE_MIN. A failed query also returns `null`: the landing page must render without the DB.
 */
async function loadExplore() {
  try {
    const [categories, { results }] = await Promise.all([listSystemCategories(), searchPublic({ page: 1 })]);
    return results.length >= EXPLORE_MIN ? { categories, collections: results.slice(0, EXPLORE_SHOW) } : null;
  } catch (error) {
    console.error("[landing] explore strip failed", error);
    return null;
  }
}
