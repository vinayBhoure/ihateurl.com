# 6 — Post-Release Changes

Fixes and changes from the owner's production review (2026-09-26), in three chunks.

Status: **Chunk 3 approved (G2 open). In progress.**
Depends on: nothing for Chunk 1; see §2 for Chunk 3 vs plan 5.

## Table of Contents
1. [Chunk gates (mandatory)](#1-chunk-gates-mandatory)
2. [Current Understanding](#2-current-understanding)
3. [Clarification Questions](#3-clarification-questions)
4. [Scope Breakdown](#4-scope-breakdown)
5. [Execution Plan](#5-execution-plan)
6. [Git Plan](#6-git-plan)
7. [Testing Plan](#7-testing-plan)

---

## 1. Chunk gates (mandatory)

| Gate | Opens | Rule |
|---|---|---|
| G0 | Chunk 1 | Owner approves this plan. |
| G1 | Chunk 2 | Owner writes "Approve chunk 2" after Chunk 1 is reported. |
| G2 | Chunk 3 | Owner writes "Approve chunk 3" after Chunk 2 is reported. |

- A chunk ends when all its tasks are `Completed`. Then: report results, stop, wait.
- Gates apply in every mode, including auto mode and `/execute-plan`. A task whose gate is not open stays `Blocked`.
- Approval of this plan opens G0 only.

---

## 2. Current Understanding

### Verified in code
| # | Finding |
|---|---|
| F1 | `src/config/env.ts`: `appUrl = NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"`. Used by copy/share/open URLs, `metadataBase`, canonical, OG, `sitemap.ts`, `robots.ts`, metadata fetcher User-Agent. Production shows localhost → variable not set for the Vercel production build. |
| F2 | Clerk sign-up asks for a username, then `/app/onboarding` asks again. Matches BUG-002 (Clerk username enabled) and BUG-003 (separate Clerk profile fields). |
| F3 | `category-picker.tsx` renders `PopoverContent` in a portal outside the `Dialog`; the dialog's scroll lock blocks wheel scroll in the list. Dialogs close on outside click (default). |
| F4 | `public-collection-row.tsx` shows `displayName ?? @username`. |
| F5 | Link rows (`collection-links.tsx`) keep Edit inside the ⋯ menu. |
| F6 | `app-header.tsx` and `public-header.tsx` use `<UserButton />` with default items only. |
| F7 | Public routes: `/[username]`, `/[username]/[slug]`; `Collection` has `@@unique([userId, slug])`, no short ID. |
| F8 | `SaveCollectionButton` shows for every non-owner viewer; no owner setting. |
| F9 | `/app/search` (own data, incl. private) and `/explore` (public) are separate pages. |

### Owner decisions
| # | Decision |
|---|---|
| O1 | Pencil (Edit) button on each link row, before ⋯. |
| O2 | Profile data kept consistent between Clerk and DB (best practice, §5 C2.4). |
| O3 | New URLs: profile `/u/{username}`; collection `/u/{username}/{slug}/{publicId}`. `publicId` = 6 chars, fixed until the collection is deleted. |
| O4 | No redirects from old URLs. |
| O5 | Username change breaks `/u/{username}` links (accepted). |
| O6 | Per-collection setting "Allow others to save a copy", default **on**. Off → button hidden, server refuses. |
| O7 | Search suggestions: max 5, 200 ms debounce. |
| O8 | One search page: `/explore` with scope switch for signed-in members. |

### Risks
| Risk | Mitigation |
|---|---|
| `publicId` backfill collision | Unique index; migration fails loudly; re-run (tiny table today). |
| Chunk 3 migration overlaps plan 5 (Prisma upgrade) | Never run in parallel (Q2). |
| Suggest endpoint load | 2-char minimum, abort stale requests, per-IP rate limit. |
| Private data in merged search | "My library" scope only for the signed-in member, `noindex`, never in suggestions for visitors. |

---

## 3. Clarification Questions

| Priority | # | Question | Default if unanswered | Answer |
|---|---|---|---|---|
| Medium | Q1 | Esc key: close form dialogs (standard keyboard behaviour) or only ✕ / Cancel? | Esc closes (accessibility) | Esc closes | 
| Medium | Q2 | Chunk 3 before or after plan 5 (Prisma upgrade)? | After plan 5 | No explicit order (developer can given command to implement) |
| Low | Q3 | Apply C2.1 dialog behaviour to all form dialogs (new collection, move link) too? | Yes, for consistency | Yes |

Defaults apply only after owner confirms at G0.

---

## 4. Scope Breakdown

| Chunk | Task | Item | Dependencies | Status |
|---|---|---|---|---|
| 1 Production fixes | C1.1 Log bugs in `docs/qa/bugs.md` | #1 #3 #5 #2b | G0 | Completed |
| 1 | C1.2 Production app URL | #3 | G0 | Completed |
| 1 | C1.3 Clerk username off | #1 | G0 | Completed |
| 2 UI fixes | C2.1 Dialog + category picker | #5 | G1 | Completed |
| 2 | C2.2 `@username` on rows | #2b | G1 | Completed |
| 2 | C2.3 Pencil on link rows | #4 | G1 | Completed |
| 2 | C2.4 User menu + Clerk/DB profile ownership | #7 | G1 | Completed (owner decision 2026-09-26: keep Clerk first/last name fields on, see BUG-003) |
| 3 Product changes | C3.1 `publicId` + `/u/` URLs | #8 | G2, Q2 | Completed |
| 3 | C3.2 Allow-copy setting | #9 | C3.1 | Completed |
| 3 | C3.3 Merge search into `/explore` | #6 | G2 | Skipped (owner decision 2026-09-26: keep `/app/search` and `/explore` separate; C3.4 scoped to public suggestions only) |
| 3 | C3.4 Search suggestions | #2a | C3.3 | Completed (public `/explore` suggestions only, no `scope=mine` — see C3.3) |
| 3 | C3.5 Docs update | all | C3.1–C3.4 | Pending |

Parallel inside a chunk: C1.2 ∥ C1.3; C2.1–C2.4 independent; C3.1 ∥ C3.3.

---

## 5. Execution Plan

Every code task ends with `npm run lint`, `npx tsc --noEmit`, `npm run build` and its Validation line. Rollback: revert the task's commits (C3.1, C3.2: plus a down migration, §5).

### Chunk 1 — Production fixes

**C1.1 Log bugs** — Add BUG-007 (#3 localhost URLs, P0), BUG-008 (#1 double username, P1), BUG-009 (#5 dialogs, P1), BUG-010 (#2b owner name not unique, P2) to `docs/qa/bugs.md`; link BUG-002/003.

**C1.2 Production app URL**
- Owner: Vercel → Production env → `NEXT_PUBLIC_APP_URL=https://ihateurl-com.vercel.app` → redeploy (value is read at build time).
- Code (`env.ts`): order `NEXT_PUBLIC_APP_URL` → `https://${VERCEL_PROJECT_PRODUCTION_URL}` (Vercel system variable) → `http://localhost:3000` only when `NODE_ENV !== "production"`. Production with none set → build fails with a clear message.
- Validation: production Copy / Share / Open use the production domain; page source canonical + `og:url` correct; `/sitemap.xml` and `/robots.txt` use the domain.

**C1.3 Clerk username off** (owner, dashboard; dev and prod instances)
- Clerk → User & authentication → turn off Username.
- Validation: new Google sign-up asks for a username once (ihateurl onboarding). Update BUG-002/008.

→ Report, stop at G1.

### Chunk 2 — UI fixes

**C2.1 Dialogs + category picker** (`collection-form-dialog.tsx`, `link-edit-dialog.tsx`, `category-picker.tsx`)
- Category list renders inside the dialog (Popover portal container = dialog content) so it scrolls.
- Dialog ignores outside clicks (`onInteractOutside` → `preventDefault`); closes via ✕, Cancel (and Esc per Q1).
- Outside click with the category list open closes the list only.
- Validation: scroll a 15+ category list with wheel and touch; outside click keeps dialog open; keyboard walk unchanged.

**C2.2 `@username` on rows** (`public-collection-row.tsx`, landing explore section)
- Show `by @username` (mono); display name not used as identifier.
- Validation: two users with the same display name are distinguishable on `/explore`.

**C2.3 Pencil on link rows** (`collection-links.tsx`)
- Icon button `Pencil`, `aria-label="Edit link"` + tooltip, before ⋯, at all widths (44 px target < 768). Remove Edit from ⋯.
- Validation: opens the same edit dialog; row has no overflow at 360 px.

**C2.4 User menu + profile ownership**
- Ownership rule (add to `docs/architecture/access-and-security.md` §3):
  - Clerk owns sign-in: email, password, connected accounts, security, photo.
  - ihateurl DB owns public profile: username, display name, bio.
- Owner (Clerk dashboard): turn off first/last name fields so "Manage account" shows only account and security. Closes BUG-003.
- Photo sync: on `/app` shell load, if Clerk `imageUrl` ≠ `User.avatarUrl`, update the DB row.
- `UserButton` custom links in both headers: "My public page" → current public profile URL, "Settings" → `/app/settings`. Verify the custom-menu API against the installed `@clerk/nextjs` version.
- Validation: change photo in Clerk → public page shows it after next `/app` visit; menu links work; "Manage account" no longer edits username/name.

→ Report, stop at G2.

### Chunk 3 — Product changes

**C3.1 `publicId` + `/u/` URLs** (#8)
- Schema: `Collection.publicId String @unique` (6 chars, `[a-z0-9]`). Migration: add nullable → backfill random IDs → `NOT NULL` + unique index. Down migration drops the column.
- Create: `generatePublicId()` with crypto random, retry on unique conflict (max 5). Never changes on rename or slug change.
- Routes: move to `src/app/(public)/u/[username]/page.tsx` and `u/[username]/[slug]/[publicId]/page.tsx`; delete old `[username]` routes (O4: no redirects).
- Lookup by `publicId` + `PUBLIC`; if `username` or `slug` in the URL is stale → `permanentRedirect` to the current URL.
- Add `u` to reserved usernames; check no existing user is named `u`.
- Update every URL builder: public pages, collection detail public URL, copy/share, profile/collection rows, sitemap, revalidate paths (`src/server/revalidate.ts`), C2.4 menu link.
- Validation: rename a public collection → old URL redirects to new slug; `/vinaybhoure` → 404; sitemap lists only new URLs; `publicId` unchanged after edits.

**C3.2 Allow-copy setting** (#9)
- Schema: `Collection.allowCopy Boolean @default(true)` (same or follow-up migration).
- Edit collection dialog: `Switch` "Allow others to save a copy", default on. Validation schema `allowCopy?: boolean`.
- Public page: hide `SaveCollectionButton` when off. `copyCollection`: source must be `PUBLIC` and `allowCopy` → else `NOT_FOUND`.
- Validation: off → button gone and direct action call refused; on → copy works.

**C3.3 Merge search into `/explore`** (#6)
- `/explore?scope=everyone|mine&q=&category=&page=`. Scope switch shown only to members; default `everyone`.
- `mine` → `searchMine` (collections + links, incl. private); visitor or non-member → treated as `everyone`.
- `scope=mine` pages: `robots: noindex`; canonical stays `/explore`.
- App header search form and nav: "Search" → "Explore" (`/explore?scope=mine`). Delete `/app/search`.
- Validation: member sees own private items only under "My library"; signed-out `?scope=mine` shows public results only.

**C3.4 Search suggestions** (#2a)
- Route handler `GET /api/explore/suggest?q=&scope=` via `src/server/routers` → controller; reuses search queries; max 5 `{ title, username, url }`.
- `mine` requires member; per-IP rate limit (in-memory, like P3).
- Client: 200 ms debounce, starts at 2 chars, aborts stale requests; ARIA combobox (↑/↓, Enter opens item, Esc closes list); Enter with no item selected → full results.
- Validation: typing sends ≤ 1 request per 200 ms pause; never more than 5 items; no private items for visitors; keyboard-only works.

**C3.5 Docs**
- `docs/prd/prd.md` §Routes and examples → `/u/...` URLs.
- `docs/architecture/`: `overview.md` (routes, layout), `data-model.md` (`publicId`, `allowCopy`, lookup index), `access-and-security.md` (suggest endpoint, scope rule, ownership rule), `server-actions.md` (`updateCollection` input, `copyCollection` rule), `glossary.md` (`publicId`, allow copy).
- `CLAUDE.md` §3 URL example; D6 note in `1_backend-mvp.md` (collection links survive renames).

→ Report, plan done.

---

## 6. Git Plan

From `origin/staging`, one branch per chunk:

```text
fix/release/production-fixes      Chunk 1
fix/ui/post-release-ui            Chunk 2
feature/public/short-urls         Chunk 3 (C3.1–C3.2, C3.5)
feature/search/unified-explore    Chunk 3 (C3.3–C3.4)
```

Commits: `docs(qa): log post-release bugs`, `fix(config): require app url in production`, `fix(ui): keep form dialogs open on outside click`, `feat(links): add edit button to link rows`, `feat(db): add collection public id`, `feat(public): move public pages under /u`, `feat(collections): add allow-copy setting`, `feat(search): merge private search into explore`, `feat(search): add explore suggestions`.

Merge: branch → `staging` → validation → `main`, per chunk.

---

## 7. Testing Plan (manual)

| Chunk | Checks |
|---|---|
| 1 | Production: copy/share/open URLs, canonical, OG, sitemap, robots; Google sign-up asks username once |
| 2 | Dialog scroll + outside click; `@username` rows; pencil at 360/768/1280; user menu links; Clerk photo sync |
| 3 | New URLs, stale-slug redirect, old URLs 404; allow-copy on/off incl. direct action call; merged search privacy (member, visitor); suggestions debounce, limit, keyboard |
| All | Regression: plan 4 Q2–Q4 rows touched by each chunk; light + dark theme |
