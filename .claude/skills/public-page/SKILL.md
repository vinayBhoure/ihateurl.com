---
name: public-page
description: Adding a public route. Use when a page is reachable without sign-in (explore, sitemap, {username}/{collection-slug}).
---

# public-page

Use when adding a public route. Follow `docs/architecture/access-and-security.md` for public-page rules before writing the query.

## Steps
1. **Query** — server component queries only records with `visibility: PUBLIC`.
2. **Not found** — call `notFound()` for any record that isn't `PUBLIC` (private and missing both resolve to 404 — never distinguish them to the visitor).
3. **Metadata** — add `generateMetadata` for the page's title/description/OG data.
4. **Sitemap** — confirm the route is included in (or correctly excluded from) the sitemap.

## Checklist
- [ ] Query filters on `visibility: PUBLIC`, no exceptions
- [ ] Non-public or missing records both return `notFound()`
- [ ] `generateMetadata` implemented
- [ ] Sitemap entry checked
- [ ] No client-side data fetching added to the page
