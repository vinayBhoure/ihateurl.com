import Link from "next/link";
import { CollectionCard } from "@/components/collection-card";
import { Button } from "@/components/ui/button";
import type { Viewer } from "@/server/auth/current-user";
import type { listSystemCategories, searchPublic } from "@/server/queries/public";

type Category = Awaited<ReturnType<typeof listSystemCategories>>[number];
type ExploreCollection = Awaited<ReturnType<typeof searchPublic>>["results"][number];

/** Landing Explore strip (plan 3 §4.2 #5): system category chips and the newest public collections. */
export function LandingExplore({
  categories,
  collections,
  viewer,
  savedIds,
}: {
  categories: Category[];
  collections: ExploreCollection[];
  viewer: Viewer;
  savedIds: Set<string>;
}) {
  return (
    <section aria-labelledby="explore-heading" className="border-t bg-muted/60">
      <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-16 md:px-6 md:py-24">
        <h2 id="explore-heading" className="text-xl font-semibold">
          Recently updated collections
        </h2>
        <nav aria-label="Browse by category" className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <Button key={c.slug} asChild size="sm" variant="outline">
              <Link href={`/explore?category=${encodeURIComponent(c.slug)}`}>{c.name}</Link>
            </Button>
          ))}
        </nav>
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {collections.map((c) => (
            <li key={c.id}>
              <CollectionCard
                collection={c}
                owner={c.user}
                viewer={viewer}
                saved={savedIds.has(c.id)}
                returnPath="/"
              />
            </li>
          ))}
        </ul>
        <Button asChild variant="outline">
          <Link href="/explore">Explore all collections</Link>
        </Button>
      </div>
    </section>
  );
}
