# 8 — Explore Redesign (Collection Cards)

Turn the Explore list into a 2-column grid of collection cards, per the owner's dark and light reference images (2026-09-26). Cards are reusable and also replace the rows on the landing Explore section and the public profile.

Status: **Approved** (owner, 2026-09-26, via `/execute-plan`).
Depends on: nothing.

## Table of Contents
1. [Current Understanding](#1-current-understanding)
2. [Design](#2-design)
3. [Clarification Questions](#3-clarification-questions)
4. [Scope Breakdown](#4-scope-breakdown)
5. [Execution Plan](#5-execution-plan)
6. [Git Plan](#6-git-plan)
7. [Testing Plan](#7-testing-plan)

---

## 1. Current Understanding

### Owner decisions (2026-09-26)
| # | Decision |
|---|---|
| O1 | Visual target: owner's reference images (dark + light). Keep ihateurl branding; do not copy Jev.Store. |
| O2 | Navbar unchanged. No "Saved", no "+ Create". |
| O3 | Bookmark icon = existing "Save to my collections" (copy). No data model change. |
| O4 | After saving from a card: stay on the page, toast "Saved to your collections" with "Open"; bookmark becomes filled and disabled. |
| O5 | Icon block: icon from the collection's first system category, colour from the collection ID (5 accents). |
| O6 | Accent colours allowed for card icon blocks only; `.claude/rules/ui.md` updated. |
| O7 | Cards are reusable: Explore, landing Explore section, public profile. |
| O8 | Public profile cards hide the creator row. |
| O9 | UserBadge moved into the hero as a separate single commit, easy to revert. |
| O10 | No change to routes, search logic, category filtering, auth or data model. No invented metrics. |

### Verified in code
| Item | Fact |
|---|---|
| Explore | `src/app/(public)/explore/page.tsx`: `h1` "Explore", `ExploreSearchForm` (with suggestions), category `Button` chips, `PublicCollectionRow` list, prev/next pagination, `UserBadgeScript`. |
| Query | `searchPublic` selects `title, slug, publicId, description, updatedAt, user, _count.items`; no `id`, `allowCopy`, links or categories. |
| Landing | `src/components/landing-explore.tsx` renders `PublicCollectionRow` in a 2-column grid from `searchPublic`. |
| Profile | `/u/[username]` renders `PublicCollectionRow` from `getPublicProfile` (no `id`, `allowCopy`, links, categories). |
| Save | `copyCollection` action returns `{ id }`; copies keep `sourceCollectionId`; `SaveCollectionButton` on the collection page navigates to the copy. |
| Icons | `Favicon` component (hotlink + `Globe` fallback) exists; lucide `^0.400`. |

### Risks
| Risk | Mitigation |
|---|---|
| Heavier Explore query (links per card) | `take: 3` items per collection, fixed `select`; page size stays 20. |
| Landing becomes per-request because of viewer state | Check `next build` route output; if landing is static today, keep it static and render landing bookmarks in signed-out mode (link to sign-in). |
| Accent colours clash with the monochrome UI | Five tokens only, used only in the icon block; checked in light and dark. |
| UserBadge widget cannot be positioned | Separate commit (E6); revert if it fails. |

---

## 2. Design

### 2.1 Card (`CollectionCard`)
```text
┌───────────────────────────────────────────┐
│ [tile]  Title                        [🔖] │
│         Description (2 lines max)         │
│         [fav][fav][fav] +N                │
│ ───────────────────────────────────────── │
│ [avatar] Display name                     │  ← hidden when showOwner=false
│          @username                        │
│ 🔗 N links · Updated 2h ago  [View →]     │
└───────────────────────────────────────────┘
```
- Container: `rounded-xl border bg-card`, `p-5`, no shadow; hover: border slightly stronger.
- Title → collection URL; "View collection →" (outline button) → same URL. Card itself is not a link, so the bookmark button is not nested inside a link (owner confirmed).
- Description: `line-clamp-2`; hidden when empty.
- Favicons: first 3 links by `position`, each `size-8 rounded-md border` with the site favicon (existing `Favicon`); `+N` chip when `count > 3`; row hidden when the collection has no links.
- Owner: avatar + display name (if set) + `@username` (mono, muted), all linking to `/u/{username}`. Display name missing → `@username` only.
- Meta: `Link2` icon, "N link(s)", "Updated {relative}" with exact date in `title`.
- Bookmark: top-right icon button (§2.3).
- Props: `collection`, `owner`, `showOwner = true`, `viewer`, `saved`.

### 2.2 Icon block (`CollectionTile`)
- `size-12 rounded-lg`, accent background + accent foreground icon.
- Icon by first system category (by name): Business `Briefcase`, Design `Palette`, Entertainment `Clapperboard`, Finance `Wallet`, Health `HeartPulse`, Learning `GraduationCap`, News `Newspaper`, Productivity `ListChecks`, Science `FlaskConical`, Technology `Terminal`; none → `Folder`.
- Colour: `hash(collection.id) % 5` → purple, green, blue, amber, rose.
- Tokens in `globals.css` (`--tile-{1..5}` and `--tile-{1..5}-foreground`): light = soft tint + strong hue; dark = deep tint + light hue. Contrast of icon on tile ≥ 3:1.

### 2.3 Bookmark (`SaveBookmarkButton`, client)
| Viewer | Shows | Click |
|---|---|---|
| Owner of the collection | nothing | — |
| `allowCopy = false` | nothing | — |
| Signed out | outline bookmark | `/login?redirect_url={current page}` |
| Signed in, not onboarded | outline bookmark | `/app/onboarding` |
| Member, not saved | outline bookmark | `copyCollection` → toast "Saved to your collections" + "Open" (`/app/collections/{id}`) → filled + disabled |
| Member, already saved | filled, disabled | — (tooltip "Saved") |
- `aria-label` "Save to my collections" / "Saved"; pending state disables the button; errors (`RATE_LIMITED`, `NOT_FOUND`) as toast.
- "Already saved" = viewer has a collection with `sourceCollectionId` = this card's id (read-only lookup, §5 E2).

### 2.4 Explore page
| Area | Design |
|---|---|
| Hero | `h1` "Discover collections worth saving" (display size), sub-line "Curated links, tools, articles and resources shared by people like you."; UserBadge pill right on `md+` (E6). |
| Search | `ExploreSearchForm` restyled: one large input (`h-12`, search icon, placeholder "Search collections, tools, resources…") + "Search" button on the right; full width on mobile. Suggestions unchanged. |
| Categories | Pills (`rounded-full`), "All" active = filled (primary), others outline. Mobile: one scrollable row (`overflow-x-auto`, no wrap); `md+`: wrap. Links unchanged. |
| Grid | `grid gap-4 md:grid-cols-2`; empty state and pagination unchanged. |
| Spacing | Hero → search → categories → grid: consistent `space-y-6`/`8`; container `max-w-5xl` (matches header). |

### 2.5 Other uses
- Landing Explore section: `CollectionCard` grid instead of rows; heading and chips unchanged.
- Public profile `/u/{username}`: `CollectionCard` with `showOwner={false}`, `md:grid-cols-2`.
- `PublicCollectionRow` deleted when no longer used.

---

## 3. Clarification Questions

None open. §1 records the owner's answers.

---

## 4. Scope Breakdown

| Task | Purpose | Dependencies | Status |
|---|---|---|---|
| E1 Accent tokens + UI rule | Tile colours for light/dark | — | Completed |
| E2 Queries | Card data + saved lookup | — | Completed |
| E3 Reusable components | `CollectionCard`, `CollectionTile`, `FaviconStack`, `RelativeTime`, `SaveBookmarkButton` | E1, E2 | Completed |
| E4 Explore page | Hero, search, pills, grid | E3 | Completed |
| E5 Landing + profile | Use cards; remove `PublicCollectionRow` | E3 | Pending |
| E6 UserBadge in hero | Position the badge (single commit) | E4 | Pending |
| E7 Docs | UI rule, feature list, architecture | E4, E5 | Pending |

Critical path: E1/E2 → E3 → E4 → E6. Parallel: E1 ∥ E2; E5 ∥ E4.

---

## 5. Execution Plan

Every task ends with `npm run lint`, `npx tsc --noEmit`, `npm run build` and its Validation line. Rollback: revert the task's commit. No migrations.

**E1 Accent tokens + UI rule**
- `globals.css`: `--tile-1..5` and `--tile-1..5-foreground` for `:root` and `.dark`; map in `@theme inline`.
- `.claude/rules/ui.md`: accents allowed only in the collection icon block (O6).
Validation: all five tiles readable in light and dark (icon contrast ≥ 3:1).

**E2 Queries** (`src/server/queries/public.ts`, `collections.ts`)
- Shared `cardSelect`: `id, title, slug, publicId, description, updatedAt, allowCopy, _count.items`, `items { take: 3, orderBy: position, link { faviconUrl, domain } }`, `categories` filtered to system ones, ordered by name, `take: 1`, `{ category { name } }` (built: no `userId`/custom categories leave the server).
- Use it in `searchPublic` and `getPublicProfile` collections. Still `visibility: PUBLIC` only; no private fields.
- `listSavedSourceIds(userId, ids)` → `Set` of source ids the viewer already copied.
- `getViewer()` shared helper (move the one in the collection page) returning `signed-out | not-onboarded | member (+ userId, username)`. Built in `src/server/auth/current-user.ts` with `viewerStatusFor(viewer, ownerUsername)` for the `owner` case.
Validation: Explore returns ≤ 3 favicons per card; private collections and `clerkId` still absent; saved lookup returns only the viewer's copies.

**E3 Reusable components** (`src/components/`)
- `collection-tile.tsx` (§2.2), `favicon-stack.tsx`, `relative-time.tsx` (client, `Intl.RelativeTimeFormat`, exact date in `title`, same hydration approach as `LocalDate`), `save-bookmark-button.tsx` (§2.3), `collection-card.tsx` (§2.1).
Validation: card renders with 0, 1–3 and 5+ links; no description; no display name; every bookmark state in §2.3; keyboard: title link → bookmark → owner link → View collection.

**E4 Explore page** (`explore/page.tsx`, `explore-search-form.tsx`)
- §2.4 hero, search, pills, grid; viewer + saved ids fetched once per page.
Validation: search, suggestions, category filter, pagination behave as before; 360/768/1280 in light and dark match the references; no horizontal scroll at 360.

**E5 Landing + profile** (`landing-explore.tsx`, `u/[username]/page.tsx`)
- §2.5; delete `public-collection-row.tsx` if unused.
Validation: landing grid and profile grid render cards; profile cards have no creator row; landing route mode unchanged or noted (§1 Risks).

**E6 UserBadge in hero** (single commit)
- Check UserBadge options for rendering into a container; if supported, mount it in the hero's right slot on `md+`; keep script on `/` and `/explore` only.
Validation: pill sits in the hero on desktop and does not overlap content on mobile. Otherwise revert this commit and leave the badge as today.

**E7 Docs**
- `docs/prd/feature-list.md`: add "Explore redesign (collection cards)" to Future Scope as Done; note 2.12 unchanged.
- `docs/architecture/overview.md` (components) if affected; tracking logs.
Validation: statements match behaviour.

---

## 6. Git Plan

Branch `feature/public/explore-cards` from `origin/staging`.

```text
feat(ui): add collection tile accent tokens
feat(public): add card data to public queries
feat(ui): add reusable collection card components
feat(public): redesign explore with collection cards
feat(public): use collection cards on landing and profile
feat(public): place userbadge in explore hero        # E6 alone, revertable
docs: update ui rule and feature list for explore cards
```

Merge: branch → `staging` → validation → `main`.

---

## 7. Testing Plan (manual)

| Area | Checks |
|---|---|
| Visual | Explore, landing, profile at 360/768/1280, light + dark vs reference images |
| Bookmark | Signed out, not onboarded, member (save → toast → filled), already saved, owner (hidden), `allowCopy` off (hidden), rate limit toast |
| Data | Only public collections; favicons from real links; `+N` correct; relative time correct |
| Accessibility | Keyboard order, focus rings, icon buttons named, tile/icon contrast |
| Regression | Search + suggestions, category filter, pagination, collection page save button, back links |
