import type { Metadata } from "next";
import Link from "next/link";
import { FolderOpen, Link2, Share2, type LucideIcon } from "lucide-react";
import { Show } from "@clerk/nextjs";
import { LinkRow, type LinkRowData } from "@/components/link-row";
import { Button } from "@/components/ui/button";
import { VisibilityBadge } from "@/components/visibility-badge";

// Title and description come from the root layout.
export const metadata: Metadata = { alternates: { canonical: "/" } };

// Static sample for the preview: no favicons are fetched (globe icons only).
const SAMPLE_LINKS: LinkRowData[] = [
  { url: "https://web.dev/learn/css", title: "Learn CSS", domain: "web.dev", faviconUrl: null, categories: [{ id: "1", name: "Learning" }] },
  { url: "https://www.refactoringui.com", title: "Refactoring UI", domain: "refactoringui.com", faviconUrl: null, categories: [{ id: "2", name: "Design" }] },
  { url: "https://developer.mozilla.org", title: "MDN Web Docs", domain: "developer.mozilla.org", faviconUrl: null, categories: [{ id: "3", name: "Technology" }] },
  { url: "https://news.ycombinator.com", title: "Hacker News", domain: "news.ycombinator.com", faviconUrl: null, categories: [{ id: "4", name: "News" }] },
];

const STEPS: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Link2, title: "Save", text: "Paste a URL. The title, description and icon are filled in for you." },
  { icon: FolderOpen, title: "Organize", text: "Group links into collections and tag them with categories. Everything starts private." },
  { icon: Share2, title: "Share", text: "Publish a collection at ihateurl.com/you/collection and send the link." },
];

export default function LandingPage() {
  return (
    <>
      <section className="mx-auto w-full max-w-5xl px-4 py-16 md:px-6 md:py-24">
        <div className="mx-auto max-w-2xl space-y-6 text-center">
          <h1 className="text-4xl font-semibold tracking-[-0.025em] text-balance md:text-5xl">
            Save links. Share collections.
          </h1>
          <p className="text-lg text-balance text-muted-foreground">
            Save URLs into collections, keep them private, publish the ones you choose at{" "}
            <span className="font-mono text-base text-foreground">ihateurl.com/you/collection</span>.
          </p>
          <div className="flex justify-center">
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
          </div>
        </div>

        {/* Decorative preview of a public collection; inert so it isn't focusable or announced. */}
        <div inert className="mx-auto mt-16 max-w-3xl overflow-hidden rounded-lg border">
          <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
            <span className="truncate font-mono text-sm">ihateurl.com/you/reading-list</span>
            <VisibilityBadge visibility="PUBLIC" />
          </div>
          <ul className="divide-y">
            {SAMPLE_LINKS.map((link) => (
              <li key={link.url}>
                <LinkRow link={link} />
              </li>
            ))}
          </ul>
        </div>
      </section>

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
