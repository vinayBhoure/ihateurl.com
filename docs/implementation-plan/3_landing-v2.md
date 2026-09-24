# 3 — Landing v2

Rebuild the landing page `/` so it shows the real product, real public collections and checkable privacy facts. Basis: Inspo study, 2026-09-24 (session `implementation-2-fix`).

Depends on: `2_frontend-mvp.md` on `staging` (F4.1 landing, F4.3 public collection, F4.4 explore). Runs before `4_polish-mvp.md`, whose QA then covers the new page.
Replaces: `2_frontend-mvp.md` FD6 and the `/` row of §5.3.
Status: **Approved** (2026-09-25; Q1 = A, LP1–LP7 accepted).

## Table of Contents
1. [Current Understanding](#1-current-understanding)
2. [Clarification Questions](#2-clarification-questions)
3. [Scope Breakdown](#3-scope-breakdown)
4. [Page Spec](#4-page-spec)
5. [Execution Plan](#5-execution-plan)
6. [Git Plan](#6-git-plan)
7. [Testing Plan](#7-testing-plan)

---

## 1. Current Understanding

### Confirmed (verified in repo)
| Item | Fact |
|---|---|
| Landing today | `src/app/(public)/page.tsx`: centered h1, sub-line, one CTA; inert 4-row list preview with `Globe` icons only; 3 icon steps (F4.1, FD6) |
| Rendering | `/` already renders per request: Clerk `<Show>` is a server component that calls `auth()`. `next.config.ts` has no Cache Components, so route segment config (`dynamic`) applies |
| Reusable UI | `LinkRow`, `VisibilityBadge`, `PublicCollectionRow`, `Avatar`, `Badge`, `Button`, `Input`; `public/og.png` (20 KB) |
| Public data | `searchPublic({ page: 1 })`: public collections, newest update first, 20 + `hasNext`, owner and link count. `listSystemCategories()`: 10 system categories. Both filter `visibility: PUBLIC` with explicit selects |
| Facts used in copy | New collections are PRIVATE (PRD §4). Private → 404 and absent from profile, explore, sitemap (F4.3–F4.5). Copy is PRIVATE, no sync (B11.1, PRD §5). Link edits show in every collection (F3.4). Username change breaks old URLs (D6) |
| Sign-in | Google + GitHub via Clerk (PRD §4); F2.3 owner check still open |
| Dev DB | 0 users, so the Explore strip stays hidden until content exists |

### Owner decisions (2026-09-25)
| # | Topic | Decision |
|---|---|---|
| LD1 | Headline | "One link for every list of links." |
| LD2 | Price | Say "Free" now (first 3–6 months). Never "free forever" or "no ads": ads or premium may come later |
| LD3 | Letter tiles | Landing preview only. The app keeps the `Globe` fallback (FP5) |
| LD4 | Explore strip | Landing reads public collections. Owner publishes 3–6 real collections before launch. Strip hidden below 3 |
| LD5 | Privacy + Terms pages | Not in this plan: `4_polish-mvp.md` R2 |
| LD6 | Plan files | This file; polish plan renamed `4_polish-mvp.md` |

### Proposed defaults (confirm or change during review)
| # | Topic | Proposal |
|---|---|---|
| LP1 | Audience | Individuals who curate links (PRD §1, §19). No team claims (Q1 = A) |
| LP2 | Visual | Quiet Index unchanged (FD1, `rules/ui.md`): tokens only, no new colors, shadows or motion. Depth from `bg-muted` bands. The green Public dot stays the only color |
| LP3 | Sub-line | Keep the approved Q2 sub-line |
| LP4 | Rendering | `export const dynamic = "force-dynamic"` (as `sitemap.ts`). No cache, so a collection made private leaves the strip on the next request. Add caching only if traffic needs it (PRD §14) |
| LP5 | Letter tile | New optional `icon` prop on `LinkRow`; only the landing passes it. Other callers unchanged |
| LP6 | FAQ | Native `<details>`/`<summary>`: no client JS, no new primitive; token styles and the standard focus ring |
| LP7 | Copy | Strings in §4.3 |

### Risks
| # | Risk | Mitigation |
|---|---|---|
| R1 | Empty or thin strip at launch | LD4: hidden below 3; owner seeds content |
| R2 | Strip frozen at build time if `<Show>` ever leaves the page | LP4 explicit `force-dynamic`; build output lists `/` as dynamic (ƒ) |
| R3 | Extra DB round trips on `/` | Two reads in `Promise.all`; measure on staging; cache in `4_polish-mvp.md` Q8 if slow |
| R4 | Preview mistaken for a working form | Frame stays `inert`; captions label each panel |
| R5 | Copy claims drift from the product | Every claim maps to a fact above; `4_polish-mvp.md` Q3 re-checks |

---

## 2. Clarification Questions

| Priority | # | Question | Why | Answer |
|---|---|---|---|---|
| High | Q1 | Audience: **A** individuals (PRD, recommended); **B** individuals now, "for teams" section later after an Unlisted visibility (PRD change); **C** teams now (new team features first, outside PRD §18) | Hero and FAQ copy; B and C change the PRD | A: individuals (2026-09-25) |
| Medium | Q2 | `public/og.png` (FD5, every public page) still reads "Save links. Share collections." Regenerate it with the LD1 headline? | Share previews contradict the new landing | Pending (found in L1.2) |

---

## 3. Scope Breakdown

| Epic | Task | Deps | Status |
|---|---|---|---|
| L1 Landing | L1.1 Hero + product frame | — | Completed |
| L1 Landing | L1.2 How it works rows | L1.1 | Completed |
| L1 Landing | L1.3 Explore strip | L1.1 | Pending |
| L1 Landing | L1.4 Privacy, FAQ, final CTA | L1.1 | Pending |

Critical path: L1.1 → L1.2. L1.3 and L1.4 follow L1.1 in any order.
Out of scope: Privacy/Terms pages and footer links (`4_polish-mvp.md` R2), team features, a working URL input in the hero, screenshots or images of other products, animation.

---

## 4. Page Spec

### 4.1 Research basis (Inspo, 2026-09-24)
| Pattern | References | Applied as |
|---|---|---|
| Real product UI right under the headline | Mintlify, Hex, minimal.so | Product frame (§4.2 #3) |
| UI shows a workflow, not one screen | Granola, Hex, Synthesia | Private panel → public panel |
| Small labels on UI panels | Hex, Mintlify, Factory | Mono URL bar on top of each panel |
| Primary + secondary CTA, sign-in method named | Hex, Mintlify, Calendly | `Sign up` + `Explore collections` + microcopy |
| Live inventory on marketplace homepages | Bandcamp, Kagi | Explore strip |
| Trust section, FAQ, final CTA | Mintlify, Kagi, Hex | Privacy block, FAQ, CTA band |

### 4.2 Sections (top to bottom)
| # | Section | Content | Layout |
|---|---|---|---|
| 1 | Header | Unchanged | — |
| 2 | Hero | h1 (display role), sub-line, CTA pair, microcopy | Centered text, `max-w-2xl` |
| 3 | Product frame | Panel A: private collection in the app. Panel B: the same collection's public page | `max-w-5xl` on a `bg-muted` band. ≥ 768 px: A and B side by side, B offset down. < 768 px: B only |
| 4 | How it works | h2; 3 rows (Save, Organize, Share): h3, one line, panel crop | ≥ 768 px: text and crop alternate sides. < 768 px: stacked |
| 5 | Explore | h2; system category chips → `/explore?category=<slug>`; 6 `PublicCollectionRow`s with owner; link to `/explore` | `bg-muted` band; rows in 2 columns ≥ 768 px. Rendered only with ≥ 3 public collections |
| 6 | Privacy | h2; 4 statements | 2 × 2 grid ≥ 768 px |
| 7 | FAQ | h2; 6 `<details>` | `max-w-3xl`, `divide-y` |
| 8 | Final CTA | h2; CTA pair | `bg-muted` band, centered |
| 9 | Footer | Unchanged | — |

Every section: `px-4 md:px-6`, `py-16 md:py-24`; `border-t` between two sections without a band.

**Panels** (static sample data, `LetterTile` icons):
| Panel | Content |
|---|---|
| A (frame) | Top bar: mono `ihateurl.com/app/collections/…` + Private badge. Title "Reading list" + `Edit` + menu; category badges; add-link row (`Input` showing `https://refactoringui.com` + `Add`); 3 `LinkRow`s with row actions (up/down ≥ 1024 px, menu) |
| B (frame) | Top bar: mono `ihateurl.com/you/reading-list` + Public badge. Title; owner avatar "Y" + "you"; "4 links · Updated today"; category badges; `Save to my collections`, copy, share (static look-alike buttons; share hidden < 768 px); 4 `LinkRow`s |
| Save crop | Add-link row + the resulting filled `LinkRow` |
| Organize crop | Collection header with 2 category badges; 2 `LinkRow`s with up/down buttons; one row's footer "In: Reading list, Design references" |
| Share crop | Mono public URL + copy + share; the pasted link in a chat with its preview: `ihateurl.com`, "Reading list by @you", "4 links curated by @you" (matches real `generateMetadata`). No `og.png` thumbnail: it still shows the old headline (Q2) |

### 4.3 Copy
| Place | Text |
|---|---|
| h1 | One link for every list of links. |
| Sub-line | Save URLs into collections, keep them private, publish the ones you choose at `ihateurl.com/you/collection`. (Q2, unchanged) |
| CTAs, signed out | `Sign up` (primary) · `Explore collections` (outline → `/explore`) |
| CTAs, signed in | `Go to app` (primary) · `Explore collections` |
| Microcopy | Free · Sign in with Google or GitHub · Collections start private |
| Panel top bars | `ihateurl.com/app/collections/…` + Private badge · `ihateurl.com/you/reading-list` + Public badge |
| How it works h2 | How it works |
| Save | Paste a URL. The title, description and icon are filled in for you. |
| Organize | Group links into collections, tag them and put them in order. One link can live in several collections. |
| Share | Make a collection public and send one link. Anyone can open it without an account. |
| Explore h2 · link | Recently updated collections · Explore all collections |
| Privacy h2 | Private means private |
| Privacy 1 | **Private by default.** Every new collection starts private. |
| Privacy 2 | **Never listed.** Private collections don't appear on your profile, in Explore, in the sitemap or in search engines. |
| Privacy 3 | **Reversible.** Make a public collection private again and it leaves Explore and the sitemap right away. |
| Privacy 4 | **No new password.** Sign in with Google or GitHub. |
| FAQ h2 | Questions |
| FAQ 1 | What does "public" mean? — Anyone with the link can open it. It's listed on your profile and in Explore, and search engines can find it. |
| FAQ 2 | Who can see my private collections? — Only you. Anyone else who opens the URL sees "Page not found". |
| FAQ 3 | Can I copy someone else's collection? — Yes. "Save to my collections" puts a private copy in your account. Later changes to the original don't carry over. |
| FAQ 4 | Can a link be in more than one collection? — Yes. Edit its title or description once and the change shows everywhere. |
| FAQ 5 | What happens if I change my username? — Your public URLs change with it, and the old ones stop working. |
| FAQ 6 | Is it free? — Yes, ihateurl is free right now. |
| Final CTA h2 | Start your first collection. |

### 4.4 Files
| File | Change |
|---|---|
| `src/app/(public)/page.tsx` | Compose sections; hero, privacy, final CTA inline; `dynamic = "force-dynamic"`; strip data (§4.5) |
| `src/components/letter-tile.tsx` | New, server: 16 px `rounded-sm` square, first letter of the title, `bg-muted text-muted-foreground`, `aria-hidden` |
| `src/components/link-row.tsx` | Optional `icon?: ReactNode`, rendered instead of `Favicon` when set |
| `src/components/landing-product-frame.tsx` | New, server: `ProductFrame` plus `SaveCrop`, `OrganizeCrop`, `ShareCrop` (§4.2 panels); sample data moves here from `page.tsx` |
| `src/components/landing-explore.tsx` | New, server: props `categories`, `collections`; chips (same `Button` chip style as `/explore`), rows, link |
| `src/components/landing-faq.tsx` | New, server: `<details>` list from §4.3 |

### 4.5 Data
- `const [categories, { results }] = await Promise.all([listSystemCategories(), searchPublic({ page: 1 })])`.
- Render the strip when `results.length >= 3`; show the first 6.
- No new query, schema change or server action. `public-page` skill checklist applies (PUBLIC-only queries, no client-side fetching).

### 4.6 Accessibility and responsive
| Area | Rule |
|---|---|
| Frame and crops | `inert`: not focusable, not announced. The copy next to each crop says what it shows |
| Headings | One h1; h2 per section; h3 per How it works row |
| FAQ | `<summary>` has the standard focus ring; opens with Enter/Space (native) |
| Targets | Chips and rows ≥ 44 px below 768 px (existing `Button size="sm"`, `PublicCollectionRow` `min-h-11`) |
| 360 px | Single column; frame shows panel B only; no horizontal scroll |
| Themes | Light and Dark; token colors only |

---

## 5. Execution Plan

Every task ends with `npm run lint`, `npx tsc --noEmit`, `npm run build` clean, plus the validation below. Rollback: revert the task's commit; nothing touches the DB.

| Order | Task | Purpose | Deps | Risks | Validation |
|---|---|---|---|---|---|
| 1 | **L1.1** Hero + product frame | LD1 h1, CTA pair, microcopy; `LetterTile`; `LinkRow` `icon` prop; `ProductFrame` replaces the old preview. Mark FD6 and the §5.3 `/` row in `2_frontend-mvp.md` as replaced; update `overview.md` | — | R4 | Signed out: `Sign up` + `Explore collections`; signed in: `Go to app`. Tab skips the frame. `LinkRow` unchanged on `/app/collections/[id]`, `/app/search`, `/{username}/{slug}`. 360/768/1280 no overflow; Light/Dark |
| 2 | **L1.2** How it works | 3 rows with crops; remove the icon steps | L1.1 | — | One h1; h2/h3 order; rows alternate ≥ 768 px, stack at 360 px |
| 3 | **L1.3** Explore strip | LP4 `force-dynamic`; §4.5 data; chips, 6 rows, link; hidden below 3. Update `overview.md` (landing reads public queries) | L1.1 | R1–R3 | Test users with 0 / 2 → hidden; 3 / 7 → 3 / 6 newest shown; chip → `/explore?category=<slug>`; one made private → gone on reload; private text never in HTML; build lists `/` as ƒ. Test data deleted after |
| 4 | **L1.4** Privacy, FAQ, final CTA | §4.2 #6–#8 with §4.3 copy | L1.1 | R5 | FAQ opens by keyboard with visible focus; each claim matches §1 facts; final CTA follows signed-in state; full keyboard walk; Light/Dark; 360/768/1280 |

---

## 6. Git Plan

Branch from `origin/staging`: `feature/public/landing-v2` (L1.1–L1.4).

```text
feat(public): rebuild landing hero with product frame
feat(public): add how-it-works rows to landing
feat(public): show recent public collections on landing
feat(public): add privacy, faq and closing cta to landing
```

Merge: branch → `staging` → manual validation → `main`. Commit or push only when the owner asks.

---

## 7. Testing Plan

| Type | Check |
|---|---|
| Per task | §5 validation + lint, types, build |
| Privacy | Public and private collections with unique titles: only the public one appears in the strip and page source; flip to private → gone on next load |
| Regression | `LinkRow` screens (`/app/collections/[id]`, `/app/search`, `/{username}/{slug}`) and `/explore` unchanged |
| Accessibility | Keyboard walk; visible focus; one h1; AA contrast in both themes |
| Responsive | 360, 768, 1280: no horizontal scroll, 44 px targets below 768 px |
| SEO | Title, description, canonical `/` unchanged; view-source shows hero and strip text |
| Plan 4 | `4_polish-mvp.md` Q3, Q6, Q8 cover `/` again after merge |
