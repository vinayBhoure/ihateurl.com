# 3 — Polish and Bug-Free (MVP)

Find and fix defects across the finished MVP, then prepare it for the first production release. Testing is manual (no test framework).

Depends on: `1_backend-mvp.md` and `2_frontend-mvp.md` merged to `staging`.
Status: **Waiting for approval.**

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
| Medium | Hosting target for production (Vercel, VPS, other)? | Needed for R1 env setup and to confirm the in-memory rate limit is acceptable. |
| Low | Browsers/devices to support (default proposal: latest Chrome, Safari, Firefox; iOS Safari; Android Chrome)? | Scope of Q7. |

---

## 3. Scope Breakdown

| Epic | Task | Dependencies | Status |
|---|---|---|---|
| Q QA | Q1 Static checks | — | Pending |
| Q QA | Q2 Phase 1 flows | Q1 | Pending |
| Q QA | Q3 Phase 2 flows | Q1 | Pending |
| Q QA | Q4 Security + privacy | Q1 | Pending |
| Q QA | Q5 Edge cases | Q2, Q3 | Pending |
| Q QA | Q6 UI consistency + accessibility | Q2, Q3 | Pending |
| Q QA | Q7 Responsive + browsers | Q6 | Pending |
| Q QA | Q8 SEO + performance | Q3 | Pending |
| F Fix | F1 Bug log and fixes | Q2–Q8 | Pending |
| R Release | R1 Release checklist | F1 | Pending |

Q2–Q4 can run in parallel. F1 runs continuously as bugs are found.

---

## 4. Execution Plan

### Q1 Static checks
`npm run lint`, `npx tsc --noEmit`, `npm run build` → zero errors, zero warnings left unexplained. Remove dead code, unused deps, `console.log`.

### Q2 Phase 1 flows (PRD §4)
| # | Check |
|---|---|
| 1 | Sign in with Google and GitHub; sign out; session persists on reload. |
| 2 | New user lands on `/app/onboarding`; valid/invalid/reserved/taken usernames give correct messages; mixed case saved lowercase. |
| 3 | Create collection → PRIVATE by default, slug generated, duplicate titles get `-2`. |
| 4 | Add URL → metadata filled; unreachable URL still saved with domain; same URL in same collection blocked; in another collection reuses link. |
| 5 | Edit link metadata → change visible in every collection containing it. |
| 6 | Reorder, move, remove (last removal deletes link), delete link, delete collection (orphans removed). |
| 7 | Private search finds by collection title/description, link title/domain, category; case-insensitive. |
| 8 | Toggle visibility PRIVATE ↔ PUBLIC. |
| 9 | Edit title, slug, description, categories; delete collection. |
| 10 | Categories: system list visible; create/delete custom; attach several to a collection and a link. |
| 11 | Settings: edit username, display name, bio; avatar shows Clerk image. |

### Q3 Phase 2 flows (PRD §5)
| # | Check |
|---|---|
| 1 | `/{username}` shows avatar, name, bio, public collections only. |
| 2 | `/{username}/{slug}` shows title, description, owner, count, last updated, links; works signed out. |
| 3 | Links open in new tab with `rel="noopener noreferrer"`. |
| 4 | Copy profile URL, copy collection URL, native share (mobile) work. |
| 5 | `/explore` search + system category filter + pagination. |
| 6 | Copy collection: signed-out prompt to sign in; signed-in copy is PRIVATE, no duplicate links, own collections cannot be copied. |
| 7 | Publishing own collection makes it appear on profile and explore. |

### Q4 Security + privacy
Access matrix and threat list: `docs/architecture/access-and-security.md` §2 and §6.

| # | Check |
|---|---|
| 1 | With user B, call every server action using user A's IDs → `NOT_FOUND`, no data change. |
| 2 | A's private collection: 404 at its URL; absent from A's profile, explore, sitemap, page source. |
| 3 | Public queries never return `clerkId` or private fields. |
| 4 | SSRF list from B7.1 re-run through the UI "Add URL" field. |
| 5 | Script/HTML in title, bio, description renders as text. |
| 6 | Rate limits trigger and show a clear message. |
| 7 | Signed-out access to `/app/*` redirects to `/login`; `/app/admin` still role-gated. |

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

### R1 Release checklist
- Clerk production instance, Google + GitHub OAuth production credentials, allowed redirect URLs.
- Production env vars: `DATABASE_URL`, Clerk keys and URLs, `NEXT_PUBLIC_APP_URL`, `RESEND_API_KEY`, `EMAIL_FROM`.
- `npm run db:deploy` then `npm run db:seed` on production DB.
- Smoke test on production: sign up, onboard, create, add link, publish, open public page signed out, share preview.
- Tag `v0.1.0` on `main`.

---

## 5. Git Plan

```text
chore/qa/static-checks
fix/<module>/<short-description>     # one per bug
docs/qa/bug-log
chore/release/v0.1.0
```

Commits: `fix(links): keep form input on failed add`, `chore(qa): remove unused deps`, `docs(qa): add bug log`.
Merge: branch → `staging` → full checklist re-run → `main`.

---

## 6. Testing Plan

- Manual: Q2–Q8 tables, run on `staging` with two test accounts.
- Regression: full Q2–Q4 re-run after the last fix and before merging to `main`.
- Exit criteria: all PRD acceptance items pass; zero open P0/P1; build clean; production smoke test passes.
