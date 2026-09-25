# 4 — Polish and Bug-Free (MVP)

Find and fix defects across the finished MVP, then prepare it for the first production release. Testing is manual (no test framework).

Depends on: `1_backend-mvp.md`, `2_frontend-mvp.md` and `3_landing-v2.md` merged to `staging`.
Status: **Approved** (owner, 2026-09-25).

## Table of Contents
1. [Current Understanding](#1-current-understanding)
2. [Clarification Questions](#2-clarification-questions)
3. [Scope Breakdown](#3-scope-breakdown)
4. [Execution Plan](#4-execution-plan)
5. [Git Plan](#5-git-plan)
6. [Testing Plan](#6-testing-plan)

---

## 1. Current Understanding

### Confirmed
- Acceptance criteria: PRD §4 (Phase 1, items 1–9) and §5 (Phase 2, items 1–7).
- Decisions D1–D15 and P1–P8 in `1_backend-mvp.md`.
- Testing: manual QA only.

### Risks
| Risk | Mitigation |
|---|---|
| Manual QA misses regressions | Fixed checklist below, re-run fully before merging to `main`. |
| Private data leak | Dedicated privacy pass (Q4) with two accounts. |
| Production config drift | Release checklist (R1). |

---

## 2. Clarification Questions

| Priority | Question | Why |
|---|---|---|
| Medium | Hosting target for production (Vercel, VPS, other)? | Needed for R1 env setup and to confirm the in-memory rate limit is acceptable. Answer (2026-09-25): Vercel, deployed manually by the owner. Rate limit (owner accepted recommendation, 2026-09-25): keep D9/P3 as built (in-memory, per user; counters are per Vercel function instance) and add one Vercel WAF rate-limit rule as the cross-instance backstop (R1). No code change; D9 stays. |
| Low | Browsers/devices to support (default proposal: latest Chrome, Safari, Firefox; iOS Safari; Android Chrome)? | Scope of Q7. Answer (owner accepted recommendation, 2026-09-25): latest stable Chrome, Edge, Firefox and Safari (macOS); Safari on the latest iOS; Chrome on the latest Android. |
| Medium | Who writes the Privacy and Terms text (owner, a template, a lawyer)? | Content for R2. Answer (2026-09-25, revised): Claude drafts it from owner facts — run by Vinay Bhoure, an individual in India; Indian law; contact `bhoure21@gmail.com`; minimum age 13 (under 18 with parental consent). Vercel's Privacy Notice and Terms used as a section outline only, no text copied. Owner reviews before release. |

---

## 3. Scope Breakdown

| Epic | Task | Dependencies | Status |
|---|---|---|---|
| Q QA | Q1 Static checks | — | Completed |
| Q QA | Q2 Phase 1 flows | Q1 | Blocked (rows 1–2: BUG-002, owner sign-out check) |
| Q QA | Q3 Phase 2 flows | Q1 | Completed (native share → Q7) |
| Q QA | Q4 Security + privacy | Q1 | Completed |
| Q QA | Q5 Edge cases | Q2, Q3 | Pending |
| Q QA | Q6 UI consistency + accessibility | Q2, Q3 | Pending |
| Q QA | Q7 Responsive + browsers | Q6 | Pending |
| Q QA | Q8 SEO + performance | Q3 | Pending |
| F Fix | F1 Bug log and fixes | Q2–Q8 | In progress (`docs/qa/bugs.md`: 2 P1, 4 P2 open) |
| R Release | R1 Release checklist | F1, R2 | Pending |
| R Release | R2 Privacy and Terms pages | Owner text | Completed (text: owner review) |

Q2–Q4 can run in parallel. F1 runs continuously as bugs are found. R2 can start any time; R1 needs its URLs.

---

## 4. Execution Plan

### Q1 Static checks
`npm run lint`, `npx tsc --noEmit`, `npm run build` → zero errors, zero warnings left unexplained. Remove dead code, unused deps, `console.log`.

Result (2026-09-25): lint, tsc, build → 0 errors; lint/tsc 0 warnings.

| Item | Outcome |
|---|---|
| Removed | `dotenv` (no imports; Next and Prisma load `.env` themselves); `public/` `file`, `globe`, `next`, `vercel`, `window` `.svg` (starter leftovers, no references); unused types `OnboardingInput`, `UpdateProfileInput`. |
| Build warning | Prisma: `package.json#prisma` is removed in Prisma 7. Works on Prisma 6; move to `prisma.config.ts` with a Prisma 7 upgrade (out of MVP). |
| `npm audit` | Was 3 high, one chain: `deepmerge-ts` < 8 (GHSA-ggr8-5vv4-36mx) via `prisma` → `@prisma/config`; no stable Prisma (6.19.3, 7.10.0; 8 is RC) ships ≥ 8. Fixed with `overrides` `deepmerge-ts ^8.0.2` (owner, 2026-09-25): only call site is `deepmerge()` as `c12`'s merger for `prisma.config.ts`; v8 breaking changes touch `deepmergeInto` and type names only. Now 0 vulnerabilities. Remove the override when Prisma ships ≥ 8 (plan 5). |
| Kept: `console.*` | `console.error` in `result.ts`, `health.controller.ts`, landing `loadExplore` (server error logs); `console.log` in `prisma/seed.ts` (CLI output). |
| Kept: unused by MVP flows | Resend, `sendEmail`, welcome template (D13); `validate.ts` (B-plan: kept for route handlers); unused shadcn sub-exports (primitives kept as generated); `@radix-ui/react-slot` in `button.tsx` (ours kept, `rules/ui.md` §5). |

### Q2 Phase 1 flows (PRD §4)
Run 2026-09-25 on local dev (Chrome, account `vinaybhoure`; `bhoure05` as second account; `QA …` test data created and deleted through the UI). Bugs: `docs/qa/bugs.md`.

| # | Check | Result |
|---|---|---|
| 1 | Sign in with Google and GitHub; sign out; session persists on reload. | Partial. Google sign-in and session across reloads pass. GitHub fails: not enabled in Clerk (BUG-002). Sign-out: owner check. |
| 2 | New user lands on `/app/onboarding`; valid/invalid/reserved/taken usernames give correct messages; mixed case saved lowercase. | Partial. Messages pass via Settings (same `usernameSchema` + taken check): `a!` → "Use 3–30 letters…", `explore` → "reserved", `bhoure05` → "taken"; `VinayBhoure` stored `vinaybhoure`. New-user onboarding: re-run with a fresh account after BUG-002. |
| 3 | Create collection → PRIVATE by default, slug generated, duplicate titles get `-2`. | Pass (`qa-alpha`, `qa-alpha-2`, PRIVATE). |
| 4 | Add URL → metadata filled; unreachable URL still saved with domain; same URL in same collection blocked; in another collection reuses link. | Pass. `example.com` title fetched; `.invalid` host saved with domain title; `https://example.com/` again → "Already in this collection", input kept; `…/?utm_source=qa#frag` in another collection reused the link (1 row, 2 collections). `http`/`https` stay distinct (D15); `example.org` → `https://` (FD4). |
| 5 | Edit link metadata → change visible in every collection containing it. | Pass. |
| 6 | Reorder, move, remove (last removal deletes link), delete link, delete collection (orphans removed). | Pass. Dialogs state the effect. BUG-006 (P2). |
| 7 | Private search finds by collection title/description, link title/domain, category; case-insensitive. | Pass (`GaMmA`, description word, `EDITED`, `example.com`, collection and link category); empty state shown. |
| 8 | Toggle visibility PRIVATE ↔ PUBLIC. | Pass both ways: public URL 200 and listed; back to private → 404, gone from profile, explore, sitemap. |
| 9 | Edit title, slug, description, categories; delete collection. | Pass. |
| 10 | Categories: system list visible; create/delete custom; attach several to a collection and a link. | Pass. Custom category created in the picker, deleted in Settings, removed from the link. |
| 11 | Settings: edit username, display name, bio; avatar shows Clerk image. | Pass. BUG-003, BUG-004 (P2). |

### Q3 Phase 2 flows (PRD §5)
Run 2026-09-25; signed-out checks by plain HTTP (no cookies).

| # | Check | Result |
|---|---|---|
| 1 | `/{username}` shows avatar, name, bio, public collections only. | Pass. |
| 2 | `/{username}/{slug}` shows title, description, owner, count, last updated, links; works signed out. | Pass (200 signed out). |
| 3 | Links open in new tab with `rel="noopener noreferrer"`. | Pass: `target="_blank" rel="noopener noreferrer nofollow ugc"`. |
| 4 | Copy profile URL, copy collection URL, native share (mobile) work. | Partial. Both copy buttons → "Copied to clipboard". Native share: check on a phone in Q7. |
| 5 | `/explore` search + system category filter + pagination. | Pass for search and category. Pagination: < 20 public collections, so no second page exists; `?page=999` shows the empty state. Re-check with seeded data in Q8. |
| 6 | Copy collection: signed-out prompt to sign in; signed-in copy is PRIVATE, no duplicate links, own collections cannot be copied. | Pass. Signed out → `/login?redirect_url=…`; copy is PRIVATE; second copy (`-2`) reused the same link row; no Save button on own collection. |
| 7 | Publishing own collection makes it appear on profile and explore. | Pass. |

### Q4 Security + privacy
Access matrix and threat list: `docs/architecture/access-and-security.md` §2 and §6.

Run 2026-09-25.

| # | Check | Result |
|---|---|---|
| 1 | With user B, call every server action using user A's IDs → `NOT_FOUND`, no data change. | Pass, 18/18. A throwaway user (created and deleted by a temporary script) called every mutating controller and the private queries with `vinaybhoure`'s QA IDs: all `NOT_FOUND`, reads empty, victim data identical before/after. All 15 actions resolve the user server-side (`require*User`); none reads a user ID from input. |
| 2 | A's private collection: 404 at its URL; absent from A's profile, explore, sitemap, page source. | Pass. |
| 3 | Public queries never return `clerkId` or private fields. | Pass: explicit `select`s in `public.ts`; no `clerkId` or Clerk IDs in page HTML. |
| 4 | SSRF list from B7.1 re-run through the UI "Add URL" field. | Pass. UI: `http://localhost:3000/` and `169.254.169.254` saved without fetched metadata; `javascript:` rejected. Fetcher: loopback, private ranges, hex/decimal IPs, IPv6, mapped IPv6, non-80/443 ports and `localtest.me` (DNS → 127.0.0.1) all blocked. |
| 5 | Script/HTML in title, bio, description renders as text. | Pass (escaped in HTML). |
| 6 | Rate limits trigger and show a clear message. | Pass at function level: call 31 (`createLink`) and 11 (`copyCollection`) → "Too many requests. Try again in a minute."; other users unaffected. Not triggered through the UI (dev metadata fetch is too slow to reach 30/min). |
| 7 | Signed-out access to `/app/*` redirects to `/login`; `/app/admin` still role-gated. | Pass (307 → `/login?redirect_url=…`; non-admin → `/app`). BUG-005 (P2 styling). |

### Q5 Edge cases
Empty states (no collections, empty collection, no search results); very long titles/URLs/descriptions truncate cleanly; non-Latin text; URL without scheme (decide: reject with message or prepend `https://` — confirm with owner if not set in frontend plan); rapid double-submit; deleting a collection open in another tab; slug/username change then old URL → 404 (accepted, D6); network error during action shows toast and keeps form input.

### Q6 UI consistency + accessibility
Against `rules/ui.md` from the frontend plan: spacing, type scale, colors, buttons, dialogs match. Keyboard-only walk of every flow; visible focus; labels on all inputs; icon buttons have `aria-label`; color contrast AA; loading and disabled states on every submit.

### Q7 Responsive + browsers
Widths 360, 768, 1280. No horizontal scroll; tap targets ≥ 44 px. Browsers per clarification answer.

### Q8 SEO + performance
- Public pages: server-rendered HTML, unique title/description, canonical, OG + Twitter tags (check with a card validator), `sitemap.xml` and `robots.txt` correct; `/app`, `/login`, `/signup`, `/api` disallowed.
- Lighthouse (mobile) on `/`, `/{username}`, `/{username}/{slug}`, `/explore`: record scores; fix issues flagged as high impact (images without size, large JS, missing indexes causing slow queries).
- Check query plans for profile, collection, explore with `EXPLAIN` on seeded data (~50 collections, ~500 links).

### F1 Bug log and fixes
- Log in `docs/qa/bugs.md`: id, area, steps, expected, actual, severity (P0 blocker / P1 major / P2 minor), status, fix commit.
- Fix P0 and P1 before release; P2 fixed or listed as known issues.
- Each fix: own `fix/<module>/<desc>` branch, re-run the related checklist rows.
- If the bug came from an AI agent's own mistake, also log it in `docs/tracking/mistakes/` (`CLAUDE.md` §1).

### R1 Release checklist
- Clerk production instance, Google + GitHub OAuth production credentials, allowed redirect URLs; Privacy and Terms URLs (R2) on the OAuth consent screens.
- Clerk settings (dev and production): sign-in with Google and GitHub only — password, username and email sign-in off (BUG-002); "Allow users to delete their accounts" per the BUG-001 decision.
- Production env vars: `DATABASE_URL`, Clerk keys and URLs, `NEXT_PUBLIC_APP_URL`, `RESEND_API_KEY`, `EMAIL_FROM`.
- Vercel WAF (Firewall → Configure → New Rule; all plans, Hobby allows 1 rate-limit rule): If `Method` equals `POST` (every server action is a POST) → Rate Limit, Fixed Window, 60 s, 120 requests, key IP, action 429. Publish, then watch the rule in the Firewall overview after launch and tune. A 429 reaches the client as a failed action (same path as the Q5 network-error check).
- `npm run db:deploy` then `npm run db:seed` on production DB.
- Smoke test on production: sign up, onboard, create, add link, publish, open public page signed out, share preview.
- Tag `v0.1.0` on `main`.

### R2 Privacy and Terms pages
Moved here from `3_landing-v2.md` (LD5).
- Routes `/privacy` and `/terms`: static server pages in `src/app/(public)/` (both already reserved usernames, B3.3); `max-w-3xl`; h1 + owner text; title, description, canonical.
- Footer links `Privacy` and `Terms` in `SiteFooter`; both URLs in `sitemap.ts`.
- Text must match the product: collections start private; what public means (profile, explore, search engines); sign-in data from Google/GitHub via Clerk; no analytics today. Price wording per `3_landing-v2.md` LD2 (no "free forever", no "no ads").
- Validation: both pages 200 signed out; footer links on every public page; listed in `/sitemap.xml`; 360/768/1280; Light/Dark.
- Result (2026-09-25): `src/app/(public)/privacy`, `src/app/(public)/terms` via shared `LegalDocument` (h1, date, contents list, numbered h2 sections). Both 200 signed out with one h1, title, description and canonical; footer `Explore · Privacy · Terms` on `/`, `/explore`, profile, collection and both legal pages (44 px targets at 360); both in `/sitemap.xml`; no horizontal overflow at 360/768/1280; Light and Dark readable; no "free forever" or "no ads". Deletion is by email request, which fits BUG-001 option A. The ₹1,000 liability cap and the 30-day deletion window are proposals for the owner to confirm.

---

## 5. Git Plan

```text
chore/qa/static-checks
fix/<module>/<short-description>     # one per bug
docs/qa/bug-log
feature/public/legal-pages           # R2
chore/release/v0.1.0
```

Commits: `fix(links): keep form input on failed add`, `chore(qa): remove unused deps`, `docs(qa): add bug log`.
Merge: branch → `staging` → full checklist re-run → `main`.

---

## 6. Testing Plan

- Manual: Q2–Q8 tables, run on `staging` with two test accounts.
- Regression: full Q2–Q4 re-run after the last fix and before merging to `main`.
- Exit criteria: all PRD acceptance items pass; zero open P0/P1; build clean; production smoke test passes.
