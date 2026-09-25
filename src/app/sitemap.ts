import type { MetadataRoute } from "next";
import { env } from "@/config/env";
import { getSitemapEntries } from "@/server/queries/public";

// Rendered per request (not cached at build), so a collection made private drops out at once.
export const dynamic = "force-dynamic";

/** `/`, `/explore`, `/privacy`, `/terms`, profiles with public collections, and public collections only (§5.4). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.appUrl;
  const { profiles, collections } = await getSitemapEntries();

  return [
    { url: `${base}/` },
    { url: `${base}/explore` },
    { url: `${base}/privacy` },
    { url: `${base}/terms` },
    ...profiles.map((p) => ({ url: `${base}/${p.username}`, lastModified: p.updatedAt })),
    ...collections.map((c) => ({ url: `${base}/${c.username}/${c.slug}`, lastModified: c.updatedAt })),
  ];
}
