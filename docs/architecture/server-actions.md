# Server Actions

## Table of Contents
1. [Contract](#1-contract)
2. [Error codes](#2-error-codes)
3. [Actions](#3-actions)

Status: contract, error codes and rate limiter **Built** (`src/server/result.ts`, `src/server/rate-limit.ts`); `checkUsername`, `completeOnboarding`, `updateProfile`, `createCategory`, `deleteCategory`, `createCollection`, `updateCollection`, `deleteCollection`, `createLink` **Built** (`src/server/actions/`); other actions **Planned**. Implementation steps: `1_backend-mvp.md`; UI usage: `2_frontend-mvp.md` §5.3.

---

## 1. Contract

```ts
type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };
```

Every action: resolve user from session → Zod parse (schema in `src/lib/validations/`) → controller → `revalidatePath` → `ActionResult`. Actions never throw to the client.

- Signed out: `requireUser()` (Clerk `auth.protect()`) throws Next's 401 interrupt; `toActionResult` maps it to `UNAUTHORIZED`. Other Next interrupts (`redirect`, `notFound`) are rethrown, not swallowed.
- `checkUsername` reports bad format, reserved and taken names as `{ available: false, reason }`; `VALIDATION` only for non-string input.
- `updateProfile`: an omitted field is unchanged; an empty `displayName` or `bio` clears it.
- `categoryIds` (collection/link actions): `categoryIdsSchema` (max 5, deduped) + `assertAttachableCategories` (system or own, else `NOT_FOUND`).
- Collections: title 1–100 (no limit in PRD; default chosen), description ≤ 500 (empty clears). Renaming keeps the slug; only an explicit `slug` changes the public URL. `categoryIds` replaces the whole set.
- `createLink`: rate limit → schema → `normalizeUrl` (its message becomes the `url` field error). `Link.url` stores the parsed input (fragment and params kept); `normalizedUrl` is the dedupe key. Metadata is fetched before, not inside, the transaction; a race on the same URL attaches the link created first.

---

## 2. Error codes

| Code | Meaning | UI |
|---|---|---|
| `VALIDATION` | Input failed Zod or a rule | Inline `fieldErrors` + toast |
| `UNAUTHORIZED` | No session | Redirect to `/login` |
| `NOT_ONBOARDED` | No `User` row | Redirect to `/app/onboarding` |
| `NOT_FOUND` | Missing or not owned | Toast; page actions → `notFound()` |
| `CONFLICT` | Unique rule hit (username, slug, URL already in collection, category name) | Inline + toast |
| `RATE_LIMITED` | Limit hit | Toast |

---

## 3. Actions

Auth column: **S** = signed-in (no `User` row required), **M** = member, owner-scoped.

| Action | Input | Auth | Errors | Revalidates |
|---|---|---|---|---|
| `checkUsername` | `username` | S | `VALIDATION` | — (returns `{ available, reason? }`) |
| `completeOnboarding` | `username`, `displayName?` | S | `VALIDATION`, `CONFLICT` | `/app` |
| `updateProfile` | `username?`, `displayName?` ≤ 60, `bio?` ≤ 280 | M | `VALIDATION`, `CONFLICT` | `/app/settings`, `/{old}`, `/{new}` |
| `createCategory` | `name` 1–30 | M | `VALIDATION`, `CONFLICT` | `/app/settings`, `/app/collections/[id]` |
| `deleteCategory` | `id` (own) | M | `NOT_FOUND` | `/app/settings`, `/app`, `/{username}` |
| `createCollection` | `title`, `description?` ≤ 500 | M | `VALIDATION` | `/app` |
| `updateCollection` | `id`, `title?`, `slug?`, `description?`, `visibility?`, `categoryIds?` ≤ 5 | M | `VALIDATION`, `NOT_FOUND`, `CONFLICT` | `/app`, `/app/collections/[id]`, `/{username}`, `/{username}/{slug}` (old + new) |
| `deleteCollection` | `id` | M | `NOT_FOUND` | same as `updateCollection` |
| `createLink` | `collectionId`, `url` | M, rate limited | `VALIDATION`, `NOT_FOUND`, `CONFLICT`, `RATE_LIMITED` | collection paths |
| `updateLink` | `id`, `title?`, `description?`, `categoryIds?` ≤ 5 | M | `VALIDATION`, `NOT_FOUND` | paths of every collection holding the link |
| `deleteLink` | `id` | M | `NOT_FOUND` | paths of every collection that held the link |
| `removeLinkFromCollection` | `itemId` | M | `NOT_FOUND` | collection paths |
| `moveLink` | `itemId`, `targetCollectionId` | M | `NOT_FOUND` | source + target collection paths |
| `reorderCollectionItems` | `collectionId`, `itemIds` (full set) | M | `VALIDATION`, `NOT_FOUND` | collection paths |
| `copyCollection` | `sourceCollectionId` | M, rate limited | `NOT_FOUND`, `RATE_LIMITED` | `/app` (returns new collection `id`) |

"Collection paths" = `/app/collections/[id]`, `/{username}/{slug}`, `/{username}`, `/app`.
