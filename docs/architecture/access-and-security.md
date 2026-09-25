# Access and Security

## Table of Contents
1. [Actors](#1-actors)
2. [Access matrix](#2-access-matrix)
3. [Identity](#3-identity)
4. [Ownership](#4-ownership)
5. [Visibility](#5-visibility)
6. [Threats and controls](#6-threats-and-controls)

Status: Clerk auth, the admin role, the identity helpers (§3.4), owner-scoped actions (§4), public queries (§5, `src/server/queries/public.ts`), the SSRF-safe fetcher (§6), public pages, robots and sitemap routes (plan 2 F4) are **Built**.

---

## 1. Actors

| Actor | Definition |
|---|---|
| Visitor | No Clerk session |
| Signed-in | Clerk session, no `User` row yet |
| Member | Clerk session + `User` row (onboarded) |
| Owner | Member whose `userId` is on the record |
| Admin | Clerk `publicMetadata.role = "admin"` (session claim `metadata.role`, `types/globals.d.ts`) |

---

## 2. Access matrix

| Route / action | Visitor | Signed-in | Member | Admin |
|---|---|---|---|---|
| `/`, `/explore`, `/{username}`, `/{username}/{slug}` | ✓ public data | ✓ | ✓ | ✓ |
| `/privacy`, `/terms` | ✓ static text, no data | ✓ | ✓ | ✓ |
| `/login`, `/signup` | ✓ | ✓ | ✓ | ✓ |
| `/app/onboarding` | → `/login` | ✓ | → `/app` | as member |
| `/app`, `/app/collections/[id]`, `/app/search`, `/app/settings` | → `/login` | → `/app/onboarding` | ✓ own data | as member |
| `/app/admin` | → `/login` | → `/app` | → `/app` | ✓ |
| `/api/health` | ✓ | ✓ | ✓ | ✓ |
| `checkUsername`, `completeOnboarding` | ✗ | ✓ | ✗ (already onboarded) | — |
| All other actions | ✗ | ✗ | ✓ owner only | as member |
| `copyCollection` | ✗ | ✗ | ✓ source is `PUBLIC` and not own | as member |

---

## 3. Identity

1. Clerk owns sign-in, OAuth (Google, GitHub) and sessions. The app stores no passwords or tokens.
2. `proxy.ts` only runs `clerkMiddleware()`. Each page, layout and action checks auth itself (`auth.protect()`, `requireOnboardedUser()`).
3. `User.clerkId` links the DB row to Clerk. The row is created in `completeOnboarding`; the avatar URL is copied from Clerk once.
4. Helpers: `getCurrentUser()` → `User | null` (memoized per request); `requireUser()` → Clerk `userId`; `requireOnboardedUser()` → `User` or `NOT_ONBOARDED` (actions); `requirePageUser()` → `User`, else redirect to `/login` or `/app/onboarding` (shell layout and pages).

---

## 4. Ownership

1. The user ID always comes from the session, never from input.
2. Load every record with `where: { id, userId }`.
3. Missing and not-yours return the same `NOT_FOUND`.
4. Actions that take several IDs (`moveLink`, `reorderCollectionItems`, `categoryIds`) verify every ID.

---

## 5. Visibility

1. Public reads live only in `src/server/queries/public.ts` and always filter `visibility: PUBLIC`.
2. A private or missing collection returns `notFound()` (404, not 403), so its existence is not revealed.
3. Public queries never select `clerkId`.
4. `/app/*` is `noindex`; `robots.txt` disallows `/app`, `/login`, `/signup`, `/api`.
5. Sitemap lists only profiles with public collections and public collections.
6. The landing page (`/`) shows the newest public collections through `searchPublic`, rendered per request (`force-dynamic`), so a collection made private leaves it on the next request.

---

## 6. Threats and controls

| Threat | Surface | Control |
|---|---|---|
| Accessing another user's data (IDOR) | All actions | §4 |
| Private data leak | Public pages, explore, sitemap, metadata tags | §5 |
| SSRF | Metadata fetch in `createLink` | Fetcher only: http(s), ports 80/443, IP checked at connect time (blocks DNS rebinding; IP-literal hosts checked before connect; any blocked address in a DNS answer rejects the host), manual redirects ≤ 3 re-checked, 5 s timeout, 1 MB cap, `text/html` only. Details: plan 1 B7.1 |
| `javascript:` / `data:` links | Saved URLs, favicon/image URLs | `normalizeUrl` and parser keep only `http(s)` |
| XSS | Titles, descriptions, bio, fetched metadata | Render as text; no `dangerouslySetInnerHTML` |
| Tab-napping, link spam | Outbound links | `target="_blank" rel="noopener noreferrer"`; saved-URL links on public pages add `nofollow ugc` (plan 2 Q3) |
| Viewer tracking by image hosts | Hotlinked favicons/OG images | `referrerPolicy="no-referrer"` |
| Route squatting | `/{username}` | Reserved username list |
| Abuse / cost | `createLink`, `copyCollection`; all server actions | In-memory per-user rate limit (P3); resets per server instance. Planned backstop: Vercel WAF per-IP limit on `POST` (plan 4 R1) |
| Error detail leak | Actions | `AppError` → safe message; unknown errors logged, generic message returned |
| Secret exposure | Env | Only `NEXT_PUBLIC_*` reach the client; never print `.env` values |
