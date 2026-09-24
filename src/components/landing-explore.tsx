import Link from "next/link";
import { PublicCollectionRow } from "@/components/public-collection-row";
import { Button } from "@/components/ui/button";
import type { listSystemCategories, searchPublic } from "@/server/queries/public";

type Category = Awaited<ReturnType<typeof listSystemCategories>>[number];
type ExploreCollection = Awaited<ReturnType<typeof searchPublic>>["results"][number];

/** Landing Explore strip (plan 3 §4.2 #5): system category chips and the newest public collections. */
export function LandingExplore({
  categories,
  collections,
}: {
  categories: Category[];
  collections: ExploreCollection[];
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
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {collections.map((c) => (
            <li key={`${c.user.username}/${c.slug}`} className="overflow-hidden rounded-lg border bg-background">
              <PublicCollectionRow username={c.user.username} collection={c} owner={c.user} />
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
