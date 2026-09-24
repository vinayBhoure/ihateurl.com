# 1 — Backend (MVP)

Data model, server logic and server actions for the MVP boundary in PRD §18:
Auth → Profile → Collections → Links → Metadata → Private/Public → Public profile → Public collection → Sharing data → Basic public search (+ categories and copy collection).

Depends on: `0_setup-mvp.md` done.
Status: **Approved** (2026-09-24; P1–P8 accepted as proposed).
Architecture reference: `docs/architecture/`.

## Table of Contents
1. [Current Understanding](#1-current-understanding)
2. [Clarification Questions](#2-clarification-questions)
3. [Folder layout](#3-folder-layout)
4. [Data Model](#4-data-model)
5. [Scope Breakdown](#5-scope-breakdown)
6. [Execution Plan](#6-execution-plan)
7. [Server Actions](#7-server-actions)
8. [Git Plan](#8-git-plan)
9. [Testing Plan (manual)](#9-testing-plan-manual)

---

## 1. Current Understanding

### Decisions (locked with owner)

| # | Topic | Decision |
|---|---|---|
| D1 | Auth | Clerk (existing). `User.clerkId` links DB row to Clerk. Google + GitHub enabled in Clerk dashboard. |
| D2 | DB | PostgreSQL only. Remove MongoDB schema and provider switch. |
| D3 | Routes | Signed-in area under `/app`; auth at `/login`, `/signup`; onboarding `/app/onboarding`; settings `/app/settings`. |
| D4 | Link lifecycle | A link always belongs to ≥1 collection. Removing it from its last collection deletes it. |
| D5 | Duplicates | One `Link` per user per `normalizedUrl`. Same link can be in many collections; metadata edits show everywhere. |
| D6 | Slug/username change | Allowed. Old URLs break in MVP (redirects next phase). |
| D7 | Search | Case-insensitive `contains` (Prisma `mode: "insensitive"`). |
| D8 | Images | Hotlink favicon/OG URLs. No S3. Avatar = Clerk profile image URL, copied at onboarding, not editable. |
| D9 | Rate limit | In-memory, no Redis. |
| D10 | Copy | `Collection.sourceCollectionId` (nullable, `SetNull`) + `copiedAt`. Not shown in UI. |
| D11 | Categories | Seeded system list + user custom categories. Many-to-many with collections and links. |
| D12 | System categories | Technology, Design, Business, Learning, Productivity, Science, Finance, Health, Entertainment, News |
| D13 | Starter leftovers | Keep Resend + `/app/admin`. Remove `Ping`, `DbCheck`, demo landing content. |
| D14 | Analytics | Not in MVP. |
| D15 | Normalization | Lowercase host, drop `#fragment`, drop default port, strip trailing slash (not on root), remove `utm_*`, `fbclid`, `gclid`. `http` and `https` stay distinct. |

### Proposed defaults (confirm or change during review)

| # | Topic | Proposal |
|---|---|---|
| P1 | User sync | No Clerk webhook. DB user is created at onboarding. `/app` layout redirects to `/app/onboarding` if no DB row. |
| P2 | Collection slug | Auto from title; `^[a-z0-9-]{1,60}$`; per-user unique; collisions get `-2`, `-3`. |
| P3 | Rate limits | `createLink` 30/min/user, `copyCollection` 10/min/user. |
| P4 | Copy rules | Only other users' `PUBLIC` collections. Copy starts `PRIVATE`. Existing URLs reused; new links copy metadata (no refetch). Only system categories are copied. |
| P5 | Public search | PRD `/search` is served by `/explore?q=`; private search at `/app/search?q=`. |
| P6 | Metadata failure | Link is still saved with `domain`; `title` falls back to hostname. |
| P7 | Explore filter | Lists system categories only. |
| P8 | Unused PRD fields | `Collection.coverImageUrl` and `CollectionItem.note` kept in schema, not used in MVP UI. |

### Risks

| Risk | Mitigation |
|---|---|
| SSRF via DNS rebinding | Validate IP at connect time with an `undici` `Agent` custom `lookup`, not only before fetch. |
| In-memory rate limit resets per instance | Accepted for MVP (D9). |
| Orphan DB user if deleted in Clerk | Out of scope for MVP; note in reference. |
| Postgres treats `NULL` as distinct in unique index | System category uniqueness enforced by seed `upsert` on `slug` + app check. |

---

## 2. Clarification Questions

None blocking. P1–P8 need a yes/no during review.

---

## 3. Folder layout

See `docs/architecture/overview.md` §5 (built vs planned).

---

## 4. Data Model

Changes on top of PRD §9 (PRD fields unchanged unless listed):

```prisma
model User {
  clerkId    String     @unique          // new
  categories Category[]                  // new
  // + PRD fields; username required (row created at onboarding)
}

model Collection {
  sourceCollectionId String?                                         // new
  source             Collection?  @relation("Copies", fields: [sourceCollectionId], references: [id], onDelete: SetNull)
  copies             Collection[] @relation("Copies")
  copiedAt           DateTime?                                       // new
  categories         CollectionCategory[]                            // new
}

model Link {
  categories LinkCategory[]                                          // new
  @@unique([userId, normalizedUrl])                                  // new
}

model Category {
  id        String   @id @default(cuid())
  userId    String?                  // null = system
  name      String
  slug      String
  user      User?    @relation(fields: [userId], references: [id], onDelete: Cascade)
  collections CollectionCategory[]
  links       LinkCategory[]
  createdAt DateTime @default(now())
  @@unique([userId, slug])
  @@index([slug])
}

model CollectionCategory {
  collectionId String
  categoryId   String
  collection Collection @relation(fields: [collectionId], references: [id], onDelete: Cascade)
  category   Category   @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  @@id([collectionId, categoryId])
  @@index([categoryId])
}

model LinkCategory { /* same shape with linkId */ }
```

Integrity rules, delete behaviour and indexes: `docs/architecture/data-model.md`.

---

## 5. Scope Breakdown

| Epic | Task | Dependencies | Status |
|---|---|---|---|
| B1 Base | B1.1 Postgres-only cleanup | — | Completed |
| B1 Base | B1.2 Remove Ping/DbCheck, rewrite health check | B1.1 | Completed |
| B1 Base | B1.3 Env + scripts | B1.1 | Completed |
| B2 Data | B2.1 Schema + first migration | B1.3 | Completed |
| B2 Data | B2.2 Category seed | B2.1 | Completed |
| B3 Core | B3.1 Auth helpers | B2.1 | Completed |
| B3 Core | B3.2 Result type, errors, rate limiter | — | Completed |
| B3 Core | B3.3 URL normalizer, slug, reserved usernames | — | Completed |
| B3 Core | B3.4 CodeGraph setup (dev tooling) | B3.1–B3.3 merged | Deferred: do not start earlier |
| B4 Profile | B4.1 Onboarding + username | B3.* | Completed |
| B4 Profile | B4.2 Update profile | B4.1 | Completed |
| B5 Categories | B5.1 List / create / delete custom | B4.1 | Completed |
| B6 Collections | B6.1 CRUD, slug, visibility, categories | B5.1 | Completed |
| B7 Metadata | B7.1 SSRF-safe fetcher | B3.3 | Completed |
| B7 Metadata | B7.2 HTML metadata parser | B7.1 | Completed |
| B8 Links | B8.1 Create link | B6.1, B7.2 | Completed |
| B8 Links | B8.2 Update / delete / remove / move / reorder | B8.1 | Completed |
| B9 Search | B9.1 Private search | B8.1 | Pending |
| B10 Public | B10.1 Public queries (profile, collection, explore, sitemap) | B6.1, B8.1 | Pending |
| B11 Copy | B11.1 Copy collection | B10.1 | Pending |

Critical path: B1 → B2 → B3.1 → B4.1 → B6.1 → B8.1 → B10.1 → B11.1
Parallel: B3.2, B3.3, B7.1–B7.2 can run alongside B2–B6.

---

## 6. Execution Plan

### B1.1 Postgres-only cleanup
- Delete `prisma/schema.mongodb.prisma`, `prisma/schema.postgresql.prisma`, `scripts/switch-db-provider.mjs`.
- `src/config/env.ts`: remove `databaseProvider`.
- `.env.example`: remove `DATABASE_PROVIDER` and MongoDB block.
- README: replace provider-switch sections with Postgres setup (short).
- **Validation:** `npm install && npm run build` succeeds. **Rollback:** revert commit.

### B1.2 Remove Ping/DbCheck
- Delete `src/components/db-check.tsx`, `src/lib/validations/ping.ts`, `Ping` model.
- `/api/health`: `GET` → `prisma.$queryRaw\`SELECT 1\`` → `{ ok: true }` / 500. Update `health.controller.ts` and `health.router.ts`; keep `validate.ts` for future route handlers.
- Remove `DbCheck` usage from `src/app/app/page.tsx` (page content replaced in frontend plan).
- **Validation:** `curl localhost:3000/api/health` → 200 with DB up, 500 with bad `DATABASE_URL`.

### B1.3 Env + scripts
- `package.json` scripts: `postinstall: prisma generate`, `dev: next dev`, `build: prisma generate && next build`, `db:migrate: prisma migrate dev`, `db:deploy: prisma migrate deploy`, `db:seed: prisma db seed`, keep `db:studio`. Remove `db:switch`, `db:push`.
- Add `prisma.seed = "tsx prisma/seed.ts"`; dev dep `tsx`.
- Add env `NEXT_PUBLIC_APP_URL` (canonical URLs, sitemap). Add to `env.ts` and `.env.example`.
- **Validation:** `npm run dev` boots; `env.appUrl` resolves.

### B2.1 Schema + migration
- Write models from §4. `npx prisma migrate dev --name init`.
- **Validation:** `prisma studio` shows all tables; unique `(userId, normalizedUrl)` and `(userId, slug)` exist.
- **Risk:** existing Neon DB may hold `Ping` table from `db push` — reset dev DB before first migration.
- **Rollback:** `prisma migrate reset` (dev only).

### B2.2 Category seed
- `prisma/seed.ts`: upsert D12 list (`userId: null`, slug = lowercase name). Idempotent.
- **Validation:** run twice → still 10 system rows.

### B3.1 Auth helpers — `src/server/auth/current-user.ts`
- `getCurrentUser()`: `auth()` → `prisma.user.findUnique({ where: { clerkId } })` → `User | null`.
- `requireUser()`: `auth.protect()` + returns Clerk `userId`.
- `requireOnboardedUser()`: throws `AppError("NOT_ONBOARDED")` if no DB row.
- **Validation:** signed-out call redirects to `/login`; signed-in without row returns null.

### B3.2 Result, errors, rate limit
- `ActionResult<T> = { ok: true; data: T } | { ok: false; error: string; fieldErrors?: Record<string, string[]> }`.
- `AppError(code)` with codes: `UNAUTHORIZED`, `NOT_ONBOARDED`, `NOT_FOUND`, `CONFLICT`, `RATE_LIMITED`, `VALIDATION`. `toActionResult(err)` maps to user-safe messages; unknown errors logged, generic message returned.
- `rateLimit(key, limit, windowMs)`: sliding window in a module-level `Map`, prune on read.
- **Validation:** 31st `createLink` in a minute returns `RATE_LIMITED`.

### B3.3 Pure helpers
- `normalizeUrl(input)` per D15; throws on non-http(s), credentials in URL, empty host.
- `slugify(title)` per P2; `uniqueSlug(userId, base)` queries existing slugs with prefix.
- `RESERVED_USERNAMES`: `app, admin, api, login, signup, onboarding, settings, explore, search, sitemap, robots, about, help, terms, privacy, _next, static, public, www, ihateurl`.
- Username schema: trim → lowercase → `^[a-z0-9_-]{3,30}$` → not reserved.
- **Validation:** manual table of inputs/outputs in PR description (e.g. `HTTPS://Ex.com:443/a/?utm_source=x#h` → `https://ex.com/a`).

### B3.4 CodeGraph setup (deferred)
- **Rule:** do not install or configure CodeGraph before B3.1–B3.3 are merged to `staging`. Too little code before then to benefit.
- **Purpose:** local code index (https://github.com/colbymchenry/codegraph) so Claude Code finds symbols, callers and impact without reading files one by one. Read-only; no source changes.
- **Owner questions before start:** telemetry off? CodeGraph section in global `~/.claude/CLAUDE.md` (recommended) or repo `CLAUDE.md`?
- **Steps (owner's Windows machine, native, not WSL2):**
  1. `npm i -g @colbymchenry/codegraph`
  2. `codegraph install` → Claude Code → restart Claude Code.
  3. `codegraph telemetry off` (if chosen).
  4. In repo: `codegraph init`, then `codegraph status`.
  5. Add `.codegraph/` to `.gitignore`.
  6. Optional `codegraph.json`: exclude `prisma/migrations/`, deprioritize `src/components/ui/`.
  7. Repo `CLAUDE.md`: one line, "use `codegraph_explore` to find code before reading files".
- **Validation:** ask Claude Code "what calls `validateBody`?" → answered from CodeGraph without file reads; `.codegraph/` not in `git status`.
- **Limits:** no Next.js route awareness (use `docs/architecture/overview.md`); works in Claude Code only, not Cowork.
- **Rollback:** `codegraph uninstall`; delete `.codegraph/`.

### B4.1 Onboarding — actions `checkUsername`, `completeOnboarding`
- `checkUsername(username)` → `{ available: boolean, reason? }`.
- `completeOnboarding({ username, displayName? })`: `requireUser()`; reject if row exists; copy `imageUrl` and name from `currentUser()`; create `User`; catch unique violation → `CONFLICT`.
- **Validation:** second user cannot take same username (any case); reserved names rejected.

### B4.2 `updateProfile({ username?, displayName?, bio? })`
- Limits: displayName ≤ 60, bio ≤ 280. Username change re-validated.
- Revalidate `/app/settings`, `/{old}`, `/{new}`.

### B5.1 Categories
- Query `listCategories(userId)` → system + own, sorted by name.
- `createCategory({ name })`: 1–30 chars; name rule I7 (`data-model.md`).
- `deleteCategory({ id })`: own only; join rows cascade.
- Attaching categories happens inside collection/link actions (`categoryIds: string[]`, max 5), validated against I6 (`data-model.md`).

### B6.1 Collections
Actions: `createCollection`, `updateCollection` (title, slug, description ≤ 500, visibility, categoryIds), `deleteCollection`.
- Every action loads the collection with `where: { id, userId }`; missing → `NOT_FOUND` (same response for "not yours").
- `deleteCollection`: transaction → delete collection → delete user links with zero items.
- Queries: `listMyCollections(userId)` (with item count), `getMyCollection(userId, id)` (items ordered by `position`, link + categories).
- Revalidate `/app`, `/app/collections/[id]`, `/{username}`, `/{username}/{slug}`.

### B7.1 SSRF-safe fetcher — `src/server/metadata/fetch.ts`
- Accept only `http:`/`https:`, ports 80/443, no userinfo.
- `undici` `Agent` with custom `lookup`: resolve all addresses, reject if any is private/loopback/link-local/CGNAT/multicast/reserved (IPv4 + IPv6, incl. `::ffff:` mapped, `169.254.169.254`).
- `redirect: "manual"`, max 3 hops, re-validate each `Location`.
- Timeout 5 s (`AbortSignal.timeout`), stop reading after 1 MB, accept only `text/html`.
- `User-Agent: ihateurl-bot/1.0 (+<APP_URL>)`.
- **Validation:** manual calls with `http://127.0.0.1`, `http://localhost`, `http://169.254.169.254`, `http://[::1]`, a public URL redirecting to `127.0.0.1`, a 5 MB page, a slow endpoint → all rejected/limited; `https://github.com` succeeds.

### B7.2 Parser — `src/server/metadata/parse.ts`
- Dependency: `node-html-parser` (no script execution).
- title: `og:title` → `twitter:title` → `<title>`; description: `og:description` → `meta[name=description]`; image: `og:image` → `twitter:image`; favicon: `link[rel~=icon]` → `/favicon.ico`. Resolve relative URLs against final URL; keep only http(s).
- Trim; title ≤ 300, description ≤ 1000.
- `getMetadata(url)` never throws; returns `{ domain, title?, description?, faviconUrl?, imageUrl? }`.

### B8.1 `createLink({ collectionId, url })`
1. `requireOnboardedUser`, `rateLimit`, validate, `normalizeUrl`.
2. Own collection check.
3. Existing link by `(userId, normalizedUrl)`:
   - already in this collection → `CONFLICT` "Already in this collection";
   - else create item only (no fetch).
4. New: `getMetadata` → transaction: create link + item at `position = max + 1`.
- **Validation:** same URL twice in one collection → conflict; in a second collection → one `Link`, two items.

### B8.2 Link actions
| Action | Rule |
|---|---|
| `updateLink({ id, title, description, categoryIds })` | Own link. Shared across collections (D5). |
| `deleteLink({ id })` | Own link; cascades items. |
| `removeLinkFromCollection({ itemId })` | Transaction: delete item; delete link if zero items left (D4). |
| `moveLink({ itemId, targetCollectionId })` | Both collections owned. If link already in target → delete source item; else update `collectionId`, `position = max + 1` in target. |
| `reorderCollectionItems({ collectionId, itemIds })` | `itemIds` must equal the collection's full item set; transaction sets `position = index`. |
- **Validation:** each action with another user's ID → `NOT_FOUND`; reorder with missing/extra IDs → `VALIDATION`.

### B9.1 Private search — `searchMine(userId, q)`
- `q` 1–100 chars. Match `contains, mode: insensitive` on collection title/description, link title/domain, category name (system + own attached).
- Returns `{ collections: [...≤20], links: [...≤20 with their collections] }`.

### B10.1 Public queries — `src/server/queries/public.ts`
All filter `visibility: PUBLIC`; anything else returns `null` (page calls `notFound()`).
| Query | Returns |
|---|---|
| `getPublicProfile(username)` | user (no `clerkId`) + public collections with item count, `updatedAt` |
| `getPublicCollection(username, slug)` | collection, owner, item count, `updatedAt`, ordered links, categories |
| `searchPublic({ q?, categorySlug?, page })` | public collections matching title/description/link title/domain/category; 20 per page |
| `listSystemCategories()` | for explore filter |
| `getSitemapEntries()` | profiles with ≥1 public collection + public collections with `updatedAt` |
- **Validation:** create a PRIVATE collection with unique text → not found by any public query.

### B11.1 `copyCollection({ sourceCollectionId })`
- Rules P4. Transaction: create collection (`uniqueSlug`, PRIVATE, `sourceCollectionId`, `copiedAt`, system categories) → for each source item in order: find-or-create user link by `normalizedUrl` (copy metadata + system categories on create) → create item.
- Rate limited (P3). Returns new collection id.
- **Validation:** copy a collection with a URL the user already has → no duplicate link; source deleted later → copy keeps working, `sourceCollectionId` null.

---

## 7. Server Actions

Full list and contracts (input, auth, errors, revalidated paths): `docs/architecture/server-actions.md`.

---

## 8. Git Plan

One branch per epic from `origin/staging`:

```text
chore/db/postgres-only          B1
feature/db/mvp-schema           B2
feature/core/server-helpers     B3
chore/tooling/codegraph         B3.4 (after B3 merged)
feature/profile/onboarding      B4
feature/categories/crud         B5
feature/collections/crud        B6
feature/links/metadata-fetcher  B7
feature/links/crud              B8
feature/search/private          B9
feature/public/queries          B10
feature/collections/copy        B11
```

Sample commits: `chore(db): remove mongodb provider switch`, `feat(db): add mvp schema and init migration`, `feat(links): add ssrf-safe metadata fetcher`, `feat(links): delete orphan link on last removal`.

Merge: branch → `staging` → manual validation → `main`.

---

## 9. Testing Plan (manual)

| Type | Check |
|---|---|
| Per task | Validation line of the task passes; `npm run lint`, `npx tsc --noEmit`, `npm run build` clean. |
| Ownership | Two Clerk test users; every action called with the other user's IDs → `NOT_FOUND`. |
| Privacy | Private collection text never appears in public queries or sitemap entries. |
| SSRF | B7.1 list. |
| Regression | `/login`, `/signup`, `/app/admin`, `/api/health` still work. |
