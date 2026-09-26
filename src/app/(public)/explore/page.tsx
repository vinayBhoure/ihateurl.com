import type { Metadata } from "next";
import Link from "next/link";
import { Compass } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { ExploreSearchForm } from "@/components/explore-search-form";
import { PublicCollectionRow } from "@/components/public-collection-row";
import { Button } from "@/components/ui/button";
import { listSystemCategories, searchPublic } from "@/server/queries/public";

const DESCRIPTION = "Browse public link collections shared on ihateurl.";

export const metadata: Metadata = {
  title: "Explore",
  description: DESCRIPTION,
  // Query variants all point to /explore (§5.4).
  alternates: { canonical: "/explore" },
  openGraph: { type: "website", url: "/explore", title: "Explore", description: DESCRIPTION, images: ["/og.png"] },
  twitter: { card: "summary_large_image", title: "Explore", description: DESCRIPTION },
};

type Params = { q?: string | string[]; category?: string | string[]; page?: string | string[] };
type Props = { searchParams: Promise<Params> };

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? "";

function exploreHref({ q, category, page }: { q?: string; category?: string; page?: number }) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (category) params.set("category", category);
  if (page && page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/explore?${query}` : "/explore";
}

export default async function ExplorePage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = first(sp.q).trim();
  const category = first(sp.category);
  const requestedPage = Number.parseInt(first(sp.page) || "1", 10);

  const [categories, { results, page, hasNext }] = await Promise.all([
    listSystemCategories(),
    searchPublic({ q: q || undefined, categorySlug: category || undefined, page: requestedPage }),
  ]);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-12 md:px-6">
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-[-0.015em]">Explore</h1>
        <ExploreSearchForm defaultValue={q} category={category} />
      </div>

      <nav aria-label="Categories" className="flex flex-wrap gap-2">
        {[{ name: "All", slug: "" }, ...categories].map((c) => {
          const active = c.slug === category;
          return (
            <Button key={c.slug || "all"} asChild size="sm" variant={active ? "default" : "outline"}>
              <Link href={exploreHref({ q, category: c.slug })} aria-current={active ? "page" : undefined}>
                {c.name}
              </Link>
            </Button>
          );
        })}
      </nav>

      {results.length === 0 ? (
        <EmptyState icon={Compass} title="No public collections match." />
      ) : (
        <ul className="divide-y rounded-lg border">
          {results.map((c) => (
            <li key={`${c.user.username}/${c.slug}`}>
              <PublicCollectionRow username={c.user.username} collection={c} owner={c.user} />
            </li>
          ))}
        </ul>
      )}

      {(page > 1 || hasNext) && (
        <nav aria-label="Pagination" className="flex items-center justify-between gap-4">
          {page > 1 ? (
            <Button asChild variant="outline">
              <Link href={exploreHref({ q, category, page: page - 1 })} rel="prev">
                Previous
              </Link>
            </Button>
          ) : (
            <span />
          )}
          <span className="text-sm text-muted-foreground">Page {page}</span>
          {hasNext ? (
            <Button asChild variant="outline">
              <Link href={exploreHref({ q, category, page: page + 1 })} rel="next">
                Next
              </Link>
            </Button>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  );
}
