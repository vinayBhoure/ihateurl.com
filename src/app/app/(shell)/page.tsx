import type { Metadata } from "next";
import Link from "next/link";
import { FolderOpen } from "lucide-react";
import { NewCollectionDialog } from "@/components/collection-form-dialog";
import { EmptyState } from "@/components/empty-state";
import { LocalDate } from "@/components/local-date";
import { PageHeader } from "@/components/page-header";
import { VisibilityBadge } from "@/components/visibility-badge";
import { requirePageUser } from "@/server/auth/current-user";
import { listMyCollections } from "@/server/queries/collections";

export const metadata: Metadata = { title: "Collections" };

export default async function CollectionsPage() {
  const user = await requirePageUser();
  const collections = await listMyCollections(user.id);

  return (
    <div className="space-y-6">
      <PageHeader title="Collections" actions={collections.length > 0 && <NewCollectionDialog />} />

      {collections.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No collections yet"
          description="Create one to start saving links."
          action={<NewCollectionDialog />}
        />
      ) : (
        <ul className="divide-y rounded-lg border">
          {collections.map((c) => (
            <li key={c.id}>
              <Link
                href={`/app/collections/${c.id}`}
                className="flex min-h-11 flex-col gap-1 px-4 py-3 transition-colors hover:bg-accent md:flex-row md:items-center md:gap-4"
              >
                <span className="min-w-0 truncate text-sm font-medium md:flex-1">{c.title}</span>
                <span className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
                  <VisibilityBadge visibility={c.visibility} />
                  <span>
                    {c._count.items} {c._count.items === 1 ? "link" : "links"}
                  </span>
                  <LocalDate date={c.updatedAt} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
