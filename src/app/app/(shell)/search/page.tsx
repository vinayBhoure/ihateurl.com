import type { Metadata } from "next";
import Link from "next/link";
import { SearchX } from "lucide-react";
import { AppSearchForm } from "@/components/app-search-form";
import { CollectionRow } from "@/components/collection-row";
import { EmptyState } from "@/components/empty-state";
import { LinkRow } from "@/components/link-row";
import { PageHeader } from "@/components/page-header";
import { requirePageUser } from "@/server/auth/current-user";
import { searchMine } from "@/server/queries/search";

export const metadata: Metadata = { title: "Search" };

const MAX_QUERY = 100;

type Props = { searchParams: Promise<{ q?: string | string[] }> };

/** P5: `/app/search?q=` over the user's own collections and links. */
export default async function SearchPage({ searchParams }: Props) {
  const user = await requirePageUser();
  const raw = (await searchParams).q;
  const q = (Array.isArray(raw) ? raw[0] : (raw ?? "")).trim();
  const tooLong = q.length > MAX_QUERY;
  const results = q && !tooLong ? await searchMine(user.id, q) : null;
  const total = results ? results.collections.length + results.links.length : 0;

  return (
    <div className="space-y-6">
      <PageHeader title="Search" />
      <AppSearchForm key={q} defaultValue={q} autoFocus />

      {tooLong && (
        <p role="alert" className="text-sm text-destructive">
          Search terms must be {MAX_QUERY} characters or fewer.
        </p>
      )}
      {!q && (
        <p className="text-sm text-muted-foreground">
          Find your collections by title, description or category, and your links by title, domain or
          category.
        </p>
      )}

      {results && total === 0 && <EmptyState icon={SearchX} title={`No results for “${q}”`} />}

      {results && results.collections.length > 0 && (
        <section aria-labelledby="results-collections" className="space-y-3">
          <h2 id="results-collections" className="text-xl font-semibold">
            Collections
          </h2>
          <ul className="divide-y rounded-lg border">
            {results.collections.map((c) => (
              <li key={c.id}>
                <CollectionRow collection={c} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {results && results.links.length > 0 && (
        <section aria-labelledby="results-links" className="space-y-3">
          <h2 id="results-links" className="text-xl font-semibold">
            Links
          </h2>
          <ul className="divide-y rounded-lg border">
            {results.links.map((l) => (
              <li key={l.id}>
                <LinkRow
                  link={l}
                  footer={
                    l.collections.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        in:{" "}
                        {l.collections.map((c, i) => (
                          <span key={c.id}>
                            {i > 0 && ", "}
                            <Link href={`/app/collections/${c.id}`} className="underline underline-offset-4 hover:text-foreground">
                              {c.title}
                            </Link>
                          </span>
                        ))}
                      </p>
                    )
                  }
                />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
