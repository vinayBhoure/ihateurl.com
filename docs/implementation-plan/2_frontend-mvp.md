# 2 — Frontend (MVP)

Design system, layouts, screens, forms, sharing and SEO for the MVP boundary in PRD §18.

Depends on: `0_setup-mvp.md` done. Screens are gated by the backend epics in `1_backend-mvp.md` (see §3).
Status: **Approved** (2026-09-24; FP1–FP8 accepted, Q1–Q5 answered in §2).

## Table of Contents
1. [Current Understanding](#1-current-understanding)
2. [Clarification Questions](#2-clarification-questions)
3. [Scope Breakdown](#3-scope-breakdown)
4. [Design System](#4-design-system)
5. [Layouts and Screens](#5-layouts-and-screens)
6. [Execution Plan](#6-execution-plan)
7. [Git Plan](#7-git-plan)
8. [Testing Plan](#8-testing-plan)

---

## 1. Current Understanding

### Confirmed (verified in repo)
| Item | Fact |
|---|---|
| Stack | Next.js 16.3.5, React 19.2.8, Tailwind 4, shadcn new-york / neutral / lucide, sonner 2, Clerk v7, Zod 3 |
| UI primitives present | `button`, `input`, `card`, `badge` in `src/components/ui/` |
| Starter leftovers | `src/app/page.tsx` (starter hero), `src/components/floating-card.tsx`, `db-check.tsx` (removed in B1.2), violet/gradient styling on `/`, `/app`, `/app/admin` |
| Tokens | `globals.css` has shadcn neutral light + `.dark` tokens; no `popover`, font or success tokens; `@custom-variant dark (&:is(.dark *))` present |
| Root layout | `ClerkProvider` + sonner `Toaster` (top-center); no fonts loaded; starter metadata |
| Auth pattern | Pages call `auth.protect()`; `proxy.ts` does not gate routes |
| Zod schemas | Only `src/lib/validations/ping.ts`. All MVP schemas come from backend tasks B3–B11 |
| Routes | D3: `/app/*`, `/login`, `/signup`, `/app/onboarding`, `/app/settings`. P5: private search `/app/search?q=`, public search `/explore?q=` |

### Owner decisions (this session)
| # | Topic | Decision |
|---|---|---|
| FD1 | Design direction | **A · Quiet Index** — ref https://minimal.so (inspo slug `minimal-so`) |
| FD2 | Dark mode | Yes: follows system, plus a manual toggle (Light / Dark / System) |
| FD3 | Reorder | Up/down buttons only. No drag library |
| FD4 | URL without scheme | Form prepends `https://` before validation |
| FD5 | OG image | One static default image for all public pages |
| FD6 | Landing `/` | Hero + static list preview + 3 steps (Save → Organize → Share) + footer |

### Proposed defaults (confirm or change during review)
| # | Topic | Proposal |
|---|---|---|
| FP1 | Forms | No `react-hook-form`. Client form: FormData → shared Zod `safeParse` → action in `useTransition` → `ActionResult`. Server Zod stays authoritative |
| FP2 | App navigation | Top bar (Collections, Search, Settings, UserButton), not a sidebar. Sheet menu below 768 px |
| FP3 | Create / edit collection | Dialogs, not separate pages. Create → redirect to `/app/collections/[id]` |
| FP4 | Onboarding redirect | Route group `src/app/app/(shell)/` whose layout redirects to `/app/onboarding` when no DB user. `/app/onboarding` and `/app/admin` sit outside the group |
| FP5 | Favicons / OG images of links | Plain `<img>` (hotlink per D8), fixed size, `loading="lazy"`, `referrerPolicy="no-referrer"`, fallback `Globe` icon. No `next/image` (arbitrary hosts) |
| FP6 | Category picker | Popover with checkbox list (system + own), max 5, "New category" input at bottom. No `cmdk` |
| FP7 | Tap targets | Buttons and inputs `h-11` below 768 px, `h-9` from 768 px (edit to `button.tsx` / `input.tsx` sizes) |
| FP8 | Public link rel | `target="_blank" rel="noopener noreferrer"` (Q3.3). See question Q3 for `nofollow ugc` |

### New dependencies
| Package | Why |
|---|---|
| `next-themes` | FD2 theme provider + toggle |
| Radix packages via `shadcn add` | Components listed in §4.5 |
| `@clerk/themes` (only if needed) | Dark Clerk widgets if CSS-variable appearance does not work (risk R2) |

### Risks
| # | Risk | Mitigation |
|---|---|---|
| R1 | Backend schemas/actions not ready when a screen starts | Each screen task lists its backend dependency; UI shell work runs first (§3) |
| R2 | Clerk `<SignIn>`/`<UserButton>` do not follow dark theme | F2.3 checks Clerk `appearance.variables` with CSS vars; fallback `@clerk/themes` `dark` switched by `useTheme()` |
| R3 | Hydration mismatch from theme class | `suppressHydrationWarning` on `<html>`; `next-themes` `attribute="class"` |
| R4 | `generateMetadata` + page double-query | Wrap public query calls in React `cache()` inside the page module |
| R5 | `/[username]` catching static routes | Static folders win in App Router; reserved usernames (B3.3) cover the rest |
| R6 | Hotlinked images break / slow | Fixed dimensions, lazy load, fallback icon on `onError` |
| R7 | shadcn CLI (v4, `new-york-v4` registry) imports `cn` from the npm package `cn` and adds it as a dependency | After each `shadcn add`: rewrite `from "cn"` → `from "@/lib/utils"`, `npm uninstall cn`. Found in F1.1 |

---

## 2. Clarification Questions

| Priority | # | Question | Why | Answer (2026-09-24) |
|---|---|---|---|---|
| Medium | Q1 | Who provides the static OG image (`public/og.png`, 1200×630)? Proposal: monochrome wordmark "ihateurl" on white, made in F4.5 | FD5 needs an asset | Proposal accepted: made in F4.5 |
| Low | Q2 | Landing copy: headline "Save links. Share collections." and sub-line "Save URLs into collections, keep them private, publish the ones you choose at ihateurl.com/you/collection." OK? | FD6 content | Yes, as written |
| Low | Q3 | Add `nofollow ugc` to `rel` on public outbound links? | SEO for user-submitted links; Q3.3 only requires `noopener noreferrer` | Yes: `rel="noopener noreferrer nofollow ugc"` |
| Low | Q4 | `/app/admin`: keep as is, or restyle to new tokens (no logic change)? | D13 keeps it; plan currently leaves it untouched | Keep as is |
| Low | Q5 | FP1–FP8: confirm | Review defaults | All accepted |

---

## 3. Scope Breakdown

| Epic | Task | Frontend deps | Backend deps | Status |
|---|---|---|---|---|
| F1 Design system | F1.1 Tokens, fonts, theme provider | — | — | Completed |
| F1 Design system | F1.2 shadcn components + size variants | F1.1 | — | Completed |
| F1 Design system | F1.3 Shared UI kit + form hook | F1.2 | B3.2 (`ActionResult`) | Completed |
| F1 Design system | F1.4 `.claude/rules/ui.md` + `.claude/skills/ui-component` | F1.3 | — | Completed |
| F2 Layouts | F2.1 Public layout, root metadata, not-found, error | F1.3 | B1.3 (`NEXT_PUBLIC_APP_URL`) | Pending |
| F2 Layouts | F2.2 App shell + onboarding redirect | F1.3 | B3.1 | Pending |
| F2 Layouts | F2.3 `/login`, `/signup` styling | F1.1 | — | Pending |
| F3 Phase 1 | F3.1 Onboarding | F2.2 | B4.1 | Pending |
| F3 Phase 1 | F3.2 My collections + create dialog | F2.2 | B6.1 | Pending |
| F3 Phase 1 | F3.3 Collection detail: header, edit, visibility, categories, delete | F3.2 | B5.1, B6.1 | Pending |
| F3 Phase 1 | F3.4 Links: add, edit, move, remove, delete, reorder | F3.3 | B8.1, B8.2 | Pending |
| F3 Phase 1 | F3.5 Private search | F2.2 | B9.1 | Pending |
| F3 Phase 1 | F3.6 Settings: profile, categories, theme | F2.2 | B4.2, B5.1 | Pending |
| F4 Phase 2 | F4.1 Landing | F2.1 | — | Pending |
| F4 Phase 2 | F4.2 Public profile | F2.1 | B10.1 | Pending |
| F4 Phase 2 | F4.3 Public collection + share + copy | F4.2, F3.4 (LinkRow) | B10.1, B11.1 | Pending |
| F4 Phase 2 | F4.4 Explore | F2.1 | B10.1 | Pending |
| F4 Phase 2 | F4.5 SEO: sitemap, robots, OG image, metadata pass | F4.2–F4.4 | B10.1 | Pending |

**Critical path:** F1.1 → F1.2 → F1.3 → F2.2 → F3.2 → F3.3 → F3.4 → F4.3 → F4.5 (gated by B6.1 → B8.2 → B10.1 → B11.1).

**Parallel with backend:**
| While backend is on | Frontend can do |
|---|---|
| B1–B2 | F1.1, F1.2, F2.3, F4.1 |
| B3 | F1.3 (after B3.2), F1.4, F2.1, F2.2 (after B3.1) |
| B4–B6 | F3.1, F3.2, F3.3, F3.6 as each backend task lands |
| B7–B9 | F3.4, F3.5 |
| B10–B11 | F4.2–F4.5 |

**Blocked:** none (Q1 answered).

---

## 4. Design System

Direction A · Quiet Index. Monochrome, no hue accent, borders over shadows, dense list rows.

### 4.1 Color tokens (`globals.css`, OKLCH, zinc scale)
| Token | Light | Dark |
|---|---|---|
| `--background` | `oklch(1 0 0)` | `oklch(0.141 0.005 285.823)` (zinc-950) |
| `--foreground` | `oklch(0.141 0.005 285.823)` | `oklch(0.985 0 0)` |
| `--card`, `--popover` | `oklch(1 0 0)` | `oklch(0.21 0.006 285.885)` (zinc-900) |
| `--card-foreground`, `--popover-foreground` | = foreground | = foreground |
| `--primary` | `oklch(0.21 0.006 285.885)` (zinc-900) | `oklch(0.985 0 0)` |
| `--primary-foreground` | `oklch(0.985 0 0)` | `oklch(0.21 0.006 285.885)` |
| `--secondary`, `--muted` | `oklch(0.967 0.001 286.375)` (zinc-100) | `oklch(0.274 0.006 286.033)` (zinc-800) |
| `--secondary-foreground` | zinc-900 | `oklch(0.985 0 0)` |
| `--muted-foreground` | `oklch(0.53 0.016 285.938)` (5.3:1 on white, 4.8:1 on muted/hover) | `oklch(0.705 0.015 286.067)` (zinc-400) |
| `--accent` (hover fill) | `color-mix(in oklab, #000 4%, transparent)` | `color-mix(in oklab, #fff 6%, transparent)` |
| `--accent-foreground` | zinc-900 | `oklch(0.985 0 0)` |
| `--border`, `--input` | `color-mix(in oklab, #000 10%, transparent)` | `color-mix(in oklab, #fff 10%, transparent)` / 15% |
| `--ring` | `oklch(0.552 0.016 285.938)` (zinc-500, 4.8:1) | `oklch(0.552 0.016 285.938)` |
| `--destructive` | `oklch(0.577 0.245 27.325)` | `oklch(0.704 0.191 22.216)` |
| `--success` (new) | `oklch(0.508 0.118 165.612)` (emerald-700) | `oklch(0.765 0.177 163.223)` (emerald-400) |

Rule: no raw Tailwind color classes (`neutral-*`, `violet-*`) in app code; tokens only. `success` only for "username available" and the Public badge dot.

Contrast (F1.1, measured): owner changed light `--muted-foreground` (was zinc-500, 4.4:1 on muted fills) and light `--ring` (was zinc-400, 2.6:1). Border/input hairlines (1.25:1 light, 1.47:1 dark) kept on purpose: dividers are decorative and every input has a visible label.

### 4.2 Typography
| Role | Size / line-height | Weight | Tracking | Use |
|---|---|---|---|---|
| display | 48/48 (36/40 < 768) | 600 | -0.025em | Landing h1 only |
| h1 | 24/32 | 600 | -0.015em | Page title in app and public pages |
| h2 | 20/28 | 600 | 0 | Section titles |
| body | 16/24 | 400 | 0 | Descriptions, bio |
| ui | 14/20 | 400 / 500 | 0 | Default for rows, buttons, inputs, nav |
| caption | 12/16 | 400 | 0 | Meta: counts, dates, domain |

Fonts via `next/font/google` (no new dep): `Geist` → `--font-sans`, `Geist_Mono` → `--font-mono`. Mono only for URLs, domains, slugs, `ihateurl.com/…` previews.

### 4.3 Spacing, radius, shadow, layout
| Token | Value |
|---|---|
| Base step | 4 px (Tailwind default) |
| Allowed gaps | 4, 8, 12, 16, 24, 32, 48, 64, 96 px |
| Page padding-inline | 16 px < 768, 24 px ≥ 768 |
| Content width | App: `max-w-3xl` (768 px). Public collection/profile: `max-w-3xl`. Landing/explore: `max-w-5xl` |
| Landing section rhythm | 96 px (64 px < 768) |
| List row | min-height 44 px, 1 px `border` dividers, hover `accent` |
| `--radius` | `0.625rem` (keep) → sm 6, md 8, lg 10, xl 14 |
| Radius use | md: buttons, inputs, badges. lg: cards, popovers. xl: dialogs, sheets |
| Shadow | none on cards; `shadow-sm` popovers/menus; `shadow-lg` dialogs. Nothing else |

### 4.4 Icons
lucide-react only, `size-4` default, `size-3.5` in badges, `strokeWidth` default.
| Purpose | Icon |
|---|---|
| Add / new | `Plus` |
| Favicon fallback | `Globe` |
| Private / Public | `Lock` / `Globe2` |
| Copy / copied | `Copy` / `Check` |
| Share | `Share2` |
| Reorder | `ArrowUp`, `ArrowDown` |
| Row menu | `MoreHorizontal` |
| Edit / delete / move | `Pencil` / `Trash2` / `FolderInput` |
| Search / settings | `Search` / `Settings` |
| Theme | `Sun`, `Moon`, `Monitor` |
| External link | `ExternalLink` |
| Pending | `Loader2` (`animate-spin`) |
| Mobile menu | `Menu` |

### 4.5 shadcn components
| Status | Components |
|---|---|
| Keep (retune to tokens) | `button`, `input`, `card`, `badge` |
| Add | `label`, `textarea`, `dialog`, `alert-dialog`, `dropdown-menu` (added in F1.1 for `ThemeToggle`), `popover`, `checkbox`, `switch`, `select`, `separator`, `skeleton`, `avatar`, `tooltip`, `sheet`, `sonner` |
| Not added | `form` (FP1), `command` (FP6), `table`, `tabs` |

Retune applied to every primitive (F1.2): focus ring per §5.5; radius/shadow per §4.3 (no shadow on controls, `shadow-sm` + `rounded-lg` popovers/menus/select, `rounded-xl` dialogs/sheets); 44 px below 768 px for buttons (all sizes), inputs (16 px text, no iOS zoom), select trigger and menu/select items (FP7); destructive text uses `text-background` (dark: 6.9:1 vs 2.9:1 with white); badge `success` variant removed (unused, §4.1 limits success); `Skeleton` static on `bg-muted` (§5.5 motion); no `tw-animate-css`, so Radix enter/exit animation classes are inert. `Toaster` without `richColors` (monochrome, type icons). `TooltipProvider` at the root.

### 4.6 Shared app components (`src/components/`)
| Component | Type | Purpose |
|---|---|---|
| `theme-provider.tsx`, `theme-toggle.tsx` | client | FD2 |
| `page-header.tsx` | server | h1 + optional description + actions slot |
| `empty-state.tsx` | server | icon, title, one line, optional action |
| `error-state.tsx` | client | message + "Try again" (`reset`) |
| `submit-button.tsx` | client | `pending` → disabled + `Loader2` |
| `copy-button.tsx` | client | `navigator.clipboard.writeText`, `Check` for 2 s, toast |
| `share-button.tsx` | client | Renders only if `navigator.share` exists |
| `favicon.tsx` | client | FP5 `<img>` with `Globe` fallback |
| `visibility-badge.tsx` | server | `Lock Private` / `Globe2 Public` |
| `link-row.tsx` | server shell + client actions slot | favicon, title (link), domain (mono), categories; read-only on public pages |
| `category-picker.tsx` | client | FP6 |
| `collection-form-dialog.tsx`, `link-edit-dialog.tsx`, `move-link-dialog.tsx` | client | Forms (§5) |
| `use-action-form.ts` (`src/hooks/`) | client hook | FP1 flow; returns `{ pending, fieldErrors, submit }` |
| `ensure-scheme.ts` (`src/lib/url/`) | pure | FD4: prepend `https://` when input has no `scheme://` |

Built in F1.3: generic kit (theme, `page-header`, `empty-state`, `error-state`, `submit-button`, `copy-button`, `share-button`, `favicon`, `visibility-badge`), `use-action-form`, `ensure-scheme`. Data-bound components ship with their screen: `collection-form-dialog` F3.2/F3.3, `category-picker` F3.3, `link-row` + `link-edit-dialog` + `move-link-dialog` F3.4 (F4.3 already depends on F3.4 for `LinkRow`). Next 16.3 passes `retry` (not `reset`) to `error.tsx`; `ErrorState` takes it as `onRetry`. `useActionForm` sends the raw values to the action (schemas transform, e.g. empty description → `null`) and ignores a submit while one is in flight.

### 4.7 Form rules
1. Schema: import from `src/lib/validations/*` (backend-owned). Never redefine in UI.
2. Client `safeParse` first; show `fieldErrors` under each input (`aria-invalid`, `aria-describedby`).
3. Submit in `startTransition`; button disabled while `pending` (no double submit); Enter on add-link input disabled while pending.
4. `ActionResult` `{ ok: false }`: `fieldErrors` inline + `toast.error(error)`. Inputs keep their values.
5. `{ ok: true }`: `toast.success`, close dialog / reset add-link input, `router.refresh()` only if the action did not `revalidatePath` the current page.
6. Destructive actions go through `AlertDialog` with the exact effect stated (e.g. "Deletes the link from every collection").

### 4.8 `.claude/rules/ui.md` content
- Tokens only (§4.1); no raw color classes, no inline hex.
- Type roles §4.2; one `h1` per page.
- Spacing/radius/shadow table §4.3.
- Icons from §4.4; icon-only buttons need `aria-label` + `Tooltip`.
- shadcn primitives only; new primitive = `npx shadcn add`, never hand-written.
- Forms follow §4.7.
- Every data screen ships loading (`loading.tsx` + `Skeleton`), empty (`EmptyState`) and error (`error.tsx`) states.
- User text rendered as text; no `dangerouslySetInnerHTML`.
- External links: `target="_blank" rel="noopener noreferrer"`.
- Accessibility + responsive checklist (§8, A-rows).
- Check both themes before commit.

### 4.9 `.claude/skills/ui-component/SKILL.md` content
- **Use when:** adding or changing a UI component or screen.
- **Steps:** 1) find an existing component in `src/components` → reuse; 2) primitives via `npx shadcn add <name>`; 3) server component by default, `"use client"` only for state/effects/handlers; 4) forms via `useActionForm` + shared Zod schema; 5) add loading/empty/error states; 6) check 360/768/1280 and light/dark; 7) keyboard walk.
- **Checklist:** tokens only · `aria-label` on icon buttons · focus visible · 44 px targets < 768 · no layout shift from images · `rules/ui.md` followed.

---

## 5. Layouts and Screens

### 5.1 File layout
```text
src/app/
  layout.tsx                 # html, fonts, ThemeProvider, ClerkProvider, Toaster, root metadata
  not-found.tsx  error.tsx   # global
  sitemap.ts  robots.ts
  (public)/
    layout.tsx               # PublicHeader + footer
    page.tsx                 # /
    explore/page.tsx
    [username]/page.tsx
    [username]/[slug]/page.tsx
  login/[[...login]]/page.tsx
  signup/[[...signup]]/page.tsx
  app/
    onboarding/page.tsx      # outside shell
    admin/page.tsx           # unchanged
    (shell)/
      layout.tsx             # auth + onboarding redirect + AppHeader, noindex
      loading.tsx  error.tsx
      page.tsx               # /app
      collections/[id]/page.tsx
      search/page.tsx
      settings/page.tsx
public/og.png
```

### 5.2 Layouts
| Layout | Content | Logic |
|---|---|---|
| Root | `<html lang="en" suppressHydrationWarning>`, Geist fonts, `ThemeProvider` (system default), `ClerkProvider`, shadcn `Toaster` | `metadata`: `metadataBase = env.appUrl`, title `{ default: "ihateurl", template: "%s · ihateurl" }`, default description, `openGraph.images = /og.png`, `twitter.card = summary_large_image` |
| Public `(public)` | Skip link; header: wordmark → `/`, `Explore`, `ThemeToggle`; signed out: `Sign in` (ghost) + `Sign up` (primary); signed in: `Go to app` + `UserButton` (Clerk `<Show>`). Footer: wordmark, `Explore`, © year | none |
| App shell `(shell)` | Skip link; top bar: wordmark → `/app`, nav `Collections` · `Search` · `Settings` (active state), search input (≥768) submitting GET `/app/search?q=`, `ThemeToggle`, `UserButton`. < 768: `Menu` → `Sheet` with same items | `auth.protect()` → `getCurrentUser()` → `null` → `redirect("/app/onboarding")`. `metadata.robots = { index: false }` |
| Onboarding | Centered card, wordmark, no nav | `auth.protect()`; if DB user exists → `redirect("/app")` |

### 5.3 Screens
| Route | Sections / components | Data | Loading | Empty | Error |
|---|---|---|---|---|---|
| `/` | Hero (display h1, sub-line, CTA: `Sign up` or `Go to app`), static list preview (`LinkRow` read-only, 4 sample rows, `Globe` icons, no hotlinks), 3 steps Save / Organize / Share (icon + h2 + one line), footer | none | — | — | root `error.tsx` |
| `/login`, `/signup` | Clerk `<SignIn>` / `<SignUp>` centered on `background`, wordmark above | Clerk | Clerk | — | Clerk |
| `/app/onboarding` | Username input (prefix `ihateurl.com/`, mono), live status (debounced 400 ms `checkUsername`: available ✓ success / reason), display name (prefilled from Clerk), avatar preview (Clerk image, read-only) | `checkUsername`, `completeOnboarding` → `/app` | `SubmitButton` pending; status `Loader2` while checking | — | inline + toast (`CONFLICT`, validation) |
| `/app` | `PageHeader` "Collections" + `New collection` (dialog: title, description; created PRIVATE) → push `/app/collections/[id]`; list rows: title, `VisibilityBadge`, item count, updated date | `listMyCollections`, `createCollection` | `loading.tsx` 5 skeleton rows | "No collections yet" + `New collection` | shell `error.tsx` |
| `/app/collections/[id]` | **Header:** h1 title, `VisibilityBadge`, description, categories badges; if PUBLIC: mono public URL + `CopyButton` + `ShareButton` + open-in-new-tab; actions: `Edit` (dialog: title, slug with `ihateurl.com/{username}/` prefix, description ≤ 500, categories, `Switch` Public) and menu → `Delete collection` (AlertDialog). **Add link:** single input + `Add` button, Enter submits, `ensureScheme` → schema → `createLink`; pending text "Fetching details…". **Links:** `LinkRow` per item + actions: `ArrowUp`/`ArrowDown` (≥768; in menu < 768), menu: `Edit` (title, description, categories; note "Changes show in every collection"), `Move to…` (Select of other collections), `Remove from collection` (AlertDialog; "last collection → link deleted"), `Delete link` (AlertDialog; "removed from all collections") | `getMyCollection`, `listCategories`, `listMyCollections` (move targets); actions `updateCollection`, `deleteCollection`, `createCategory`, `createLink`, `updateLink`, `moveLink`, `removeLinkFromCollection`, `deleteLink`, `reorderCollectionItems` | `loading.tsx` header + 5 row skeletons; add-link pending; reorder optimistic via `useOptimistic`, rolls back on error | "No links yet. Paste a URL above." | `notFound()` for `NOT_FOUND`; action errors inline + toast (`CONFLICT` "Already in this collection", `RATE_LIMITED`) |
| `/app/search?q=` | h1 "Search", GET form (autofocus), two groups: Collections (row → detail), Links (`LinkRow` + "in: {collection}" links) | `searchMine` | `loading.tsx` | No `q`: hint line. No hits: "No results for “q”" | `error.tsx`; `q` > 100 chars → inline message |
| `/app/settings` | **Profile:** avatar (Clerk, read-only), username (warn: "old public URLs stop working", D6), display name ≤ 60, bio ≤ 280 with counter. **Categories:** system list (read-only badges), own categories with delete (AlertDialog), add input. **Appearance:** Light/Dark/System select | `getCurrentUser`, `listCategories`; `updateProfile`, `createCategory`, `deleteCategory` | `loading.tsx` | "No custom categories" | inline + toast |
| `/{username}` | Avatar, display name, `@username` (mono), bio; `CopyButton` + `ShareButton` for profile URL; list of public collections (title, description line, count, updated) | `getPublicProfile` (`cache`) | `loading.tsx` | "No public collections yet." | `notFound()` if null |
| `/{username}/{slug}` | h1 title, description, owner (avatar + name → profile), "N links · Updated {date}", category badges; `CopyButton`, `ShareButton`, `Save to my collections` (signed out → `/login?redirect_url=…`; own → hidden; signed in → `copyCollection` → toast + push `/app/collections/[newId]`); `LinkRow` list read-only, external links FP8 | `getPublicCollection` (`cache`), `auth()`, `copyCollection` | `loading.tsx` | "This collection has no links yet." | `notFound()` if null; copy errors toast (`RATE_LIMITED`) |
| `/explore?q=&category=&page=` | h1 "Explore", GET search form, category chips as links (system only, P7, "All" first, active state), result rows (title, owner, count, updated), prev/next pagination links | `searchPublic`, `listSystemCategories` | `loading.tsx` | "No public collections match." | `error.tsx` |
| not-found | h1 "Page not found", link to `/` and `/explore` | — | — | — | — |
| error | `ErrorState` with `reset()` and link home; no error details shown | — | — | — | — |
| `/app/admin` | Unchanged (Q4) | Clerk role | — | — | — |

### 5.4 Sharing and SEO
| Item | Rule |
|---|---|
| Copy URL | `CopyButton` with absolute URL `${appUrl}/{username}[/{slug}]` |
| Native share | `ShareButton` → `navigator.share({ title, url })`; hidden when unsupported; `AbortError` ignored |
| `generateMetadata` | Profile: title `{displayName ?? username} (@{username})`, description = bio or "Public collections by @{username}". Collection: title `{title} by @{username}`, description = description or "{n} links curated by @{username}". Explore: title "Explore" |
| Canonical | `alternates.canonical` = `/{username}`, `/{username}/{slug}`, `/explore` (query variants point to `/explore`) |
| OG / Twitter | `openGraph: { type: "website", url, title, description, images: ["/og.png"] }`, `twitter: { card: "summary_large_image" }` |
| Private | `/app/*` layout `robots: { index: false }`; private collections → `notFound()` so no metadata leaks |
| `app/sitemap.ts` | `/`, `/explore`, then `getSitemapEntries()` → profiles + public collections with `lastModified = updatedAt` |
| `app/robots.ts` | allow `/`; disallow `/app`, `/login`, `/signup`, `/api`; `sitemap: ${appUrl}/sitemap.xml` |

### 5.5 Accessibility and responsive
| Area | Rule |
|---|---|
| Keyboard | Every action reachable by Tab; dialogs/menus via Radix (focus trap, Esc); Enter submits add-link; up/down buttons disabled at list ends |
| Focus | `focus-visible:ring-2 ring-ring ring-offset-2 ring-offset-background` on all interactive elements |
| Skip link | "Skip to content" → `#main` in public and shell layouts |
| Labels | Every input has `<Label>`; icon-only buttons `aria-label` + `Tooltip` |
| Contrast | AA in both themes (text ≥ 4.5:1, UI ≥ 3:1); checked per theme in F1.1 |
| Motion | Only `animate-spin` on pending; respect `prefers-reduced-motion` (Radix defaults) |
| 360 px | Single column; shell nav in `Sheet`; row actions collapse into one menu (incl. Move up/down); header CTAs shrink to icon buttons with labels; no horizontal scroll (long titles `truncate`, URLs `break-all`) |
| 768 px | Inline nav + header search; up/down visible per row; controls `h-9` (FP7) |
| 1280 px | Content centered at max widths §4.3; landing steps in 3 columns |

---

## 6. Execution Plan

Every task ends with `npm run lint`, `npx tsc --noEmit`, `npm run build` clean, plus the validation below. Rollback for every task: revert its commit(s) on the branch; nothing touches the DB.

| Order | Task | Purpose | Deps | Risks | Validation |
|---|---|---|---|---|---|
| 1 | **F1.1** Tokens, fonts, theme | Replace neutral tokens with §4.1; add `popover`, `success`, font tokens to `@theme inline`; Geist via `next/font/google`; install `next-themes`; `ThemeProvider` + `ThemeToggle`; root metadata placeholder | — | R3 | Toggle Light/Dark/System works, no hydration warning in console; contrast spot-check (muted text, borders) both themes |
| 2 | **F1.2** shadcn components | `npx shadcn add` list §4.5; retune `button`/`input` sizes (FP7); replace root `Toaster` with shadcn `sonner` | F1.1 | CLI output for Tailwind 4 differs from existing files | Scratch render of each primitive in both themes (temporary, not committed) |
| 3 | **F1.3** UI kit + form hook | Components §4.6, `useActionForm`, `ensureScheme` | F1.2, B3.2 | — | `ensureScheme`: `github.com/x` → `https://github.com/x`; `http://a.b` unchanged; `ftp://a` unchanged (backend rejects) |
| 4 | **F1.4** Claude rules/skill | Write `.claude/rules/ui.md` (§4.8), `.claude/skills/ui-component/SKILL.md` (§4.9) | F1.3 | `.claude/` not writable in some remote tools | Files exist, < 150 lines, no conflict with plans |
| 5 | **F2.1** Public layout + globals | `(public)` group, header/footer, move `/` into group, `not-found.tsx`, `error.tsx`, root metadata (§5.2) | F1.3, B1.3 | Moving `page.tsx` breaks imports | `/` renders in group; unknown URL → not-found; thrown error → error page |
| 6 | **F2.2** App shell | `(shell)` group + layout logic (FP4), `AppHeader`, `Sheet`, `loading.tsx`, `error.tsx`, noindex; move `app/page.tsx` into group | F1.3, B3.1 | Redirect loop between shell and onboarding | Signed out `/app` → `/login`; signed in, no DB row → `/app/onboarding`; with row → `/app`; `/app/admin` still role-gated (Q4.7) |
| 7 | **F2.3** Clerk pages | Wordmark + token background; `appearance` variables; dark mode check | F1.1 | R2 | Sign in / up with Google + GitHub in both themes |
| 8 | **F3.1** Onboarding | §5.3 row | F2.2, B4.1 | Debounce races | Q2.2 cases: valid, invalid, reserved, taken, mixed case → lowercase |
| 9 | **F3.2** My collections | List + create dialog | F2.2, B6.1 | — | Q2.3: create → PRIVATE, slug `-2` on duplicate title; empty state shows for new user |
| 10 | **F3.3** Collection header | Edit dialog, visibility switch, categories, delete, public URL/share | F3.2, B5.1, B6.1 | Slug change leaves user on stale URL | Q2.8, Q2.9, Q2.10; slug change keeps user on `/app/collections/[id]` |
| 11 | **F3.4** Links | Add, edit, move, remove, delete, reorder (optimistic) | F3.3, B8.1, B8.2 | Optimistic order out of sync after error | Q2.4–Q2.6; FD4 `github.com` saves as `https://github.com`; double Enter adds once; rate limit toast |
| 12 | **F3.5** Private search | §5.3 row + header search | F2.2, B9.1 | — | Q2.7 |
| 13 | **F3.6** Settings | Profile, categories, appearance | F2.2, B4.2, B5.1 | Username change | Q2.11; custom category create/delete; theme persists on reload |
| 14 | **F4.1** Landing | FD6 content (Q2 copy); delete `floating-card.tsx` and starter hero (D13) | F2.1 | — | 360/768/1280 no overflow; signed-in CTA → `/app` |
| 15 | **F4.2** Public profile | §5.3 row, `generateMetadata`, `cache()` | F2.1, B10.1 | R4 | Q3.1; private collections absent; signed out works |
| 16 | **F4.3** Public collection | §5.3 row, share, copy collection | F4.2, F3.4, B10.1, B11.1 | Copy button on own collection | Q3.2–Q3.4, Q3.6, Q3.7; private URL → 404 |
| 17 | **F4.4** Explore | §5.3 row | F2.1, B10.1 | — | Q3.5: search, category filter, pagination; private text not found |
| 18 | **F4.5** SEO | `sitemap.ts`, `robots.ts`, `public/og.png`, metadata review | F4.2–F4.4, Q1 | Wrong `metadataBase` in prod | Q8: `/sitemap.xml` lists only public; `/robots.txt` rules; card validator shows title, description, image |

---

## 7. Git Plan

Branches from `origin/staging` (`git fetch origin && git checkout -b <branch> origin/staging`):

```text
feature/ui/design-system        F1.1–F1.4
feature/ui/layouts              F2.1–F2.3
feature/profile/onboarding-ui   F3.1
feature/collections/ui          F3.2–F3.3
feature/links/ui                F3.4
feature/search/private-ui       F3.5
feature/settings/ui             F3.6
feature/public/landing          F4.1
feature/public/pages            F4.2–F4.4
feature/seo/sitemap-og          F4.5
```

Sample commits:
```text
feat(ui): add quiet-index tokens and geist fonts
feat(ui): add theme provider and toggle
feat(ui): add shadcn dialog, menu, sheet primitives
docs(claude): add ui rules and ui-component skill
feat(app): add app shell with onboarding redirect
feat(links): add link row actions and reorder buttons
feat(public): add public collection page with share
feat(seo): add sitemap, robots and default og image
```

Merge: branch → `staging` → manual validation → `main`. Commit or push only when the owner asks.

---

## 8. Testing Plan (manual)

| Type | Check |
|---|---|
| Per task | §6 validation column + lint, types, build |
| Flows | `3_polish-mvp.md` Q2 (Phase 1) and Q3 (Phase 2) rows mapped in §6 |
| Edge cases | Q5: empty states, long titles/URLs truncate, non-Latin text, URL without scheme (FD4), rapid double submit, network error keeps input |
| A1 Keyboard | Full keyboard walk: onboarding, create collection, add/edit/move/remove/reorder link, publish, copy, share, settings |
| A2 Focus + labels | Visible focus everywhere; all inputs labelled; icon buttons named (screen reader spot check) |
| A3 Contrast | AA in light and dark on every screen |
| R Responsive | 360, 768, 1280: no horizontal scroll, 44 px targets < 768 (Q7) |
| Theme | Every screen in Light and Dark; System follows OS; no flash on reload |
| SEO | Q8 rows; view-source of public pages shows content, canonical, OG, Twitter tags |
| Privacy | Private collection: 404 at URL, absent from profile, explore, sitemap, page source (Q4.2) |
| Regression | `/login`, `/signup`, `/app/admin`, `/api/health` still work |
