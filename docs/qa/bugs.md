# QA Bug Log

Plan 4 F1. One row per defect found in Q2–Q8. Severity: **P0** blocker, **P1** major (fix before release), **P2** minor (fix or list as known issue).

## Table of Contents
1. [Open](#1-open)
2. [Details](#2-details)
3. [Fixed](#3-fixed)

---

## 1. Open

| ID | Area | Severity | Summary | Found in | Status |
|---|---|---|---|---|---|
| BUG-001 | Auth / privacy | P1 | Clerk "Delete account" leaves the ihateurl profile and public collections online | Q2.11, Q4 | Open — owner decision |
| BUG-002 | Auth config | P1 | Clerk dev instance: GitHub sign-in off; email, username and password sign-in on | Q2.1 | Open — owner (Clerk dashboard) |
| BUG-003 | Auth / settings | P2 | Clerk "Manage account" edits a separate username, name and photo that ihateurl never reads | Q2.11 | Open |
| BUG-004 | Settings | P2 | Username field keeps the typed casing after save until reload | Q2.11 | Open |
| BUG-005 | UI | P2 | `/app/admin` uses raw palette classes (starter page kept by D13) | Q4.7 | Open |
| BUG-006 | Links | P2 | "Move to…" lists collections by title only; duplicate titles look identical | Q2.6 | Open |

---

## 2. Details

### BUG-001 — Clerk self-delete leaves data online (P1)
- Steps: signed in → avatar menu → Manage account → Security → "Delete account" (present; `deleteSelfEnabled: true`).
- Expected: deleting the account removes the ihateurl profile, collections, links and categories, or the option is not offered.
- Actual: only the Clerk user is deleted. Nothing in the app reacts (no Clerk webhook, no delete-account flow), so `/{username}` and public collections stay online and the person can no longer sign in to remove them. Verified by code search; not executed (irreversible).
- Fix options: (A) turn off "Allow users to delete their accounts" in Clerk (dev + production) and handle deletion by email as the Privacy Notice states — no code; (B) add an account-deletion flow (Clerk `user.deleted` webhook or in-app delete) — new feature, outside the MVP list. Recommended: A for `v0.1.0`.

### BUG-002 — Clerk sign-in methods differ from the product decision (P1)
- Steps: read `Clerk.__unstable__environment.userSettings` on `/app/settings` (dev instance).
- Expected: Google and GitHub only (CLAUDE.md key decisions).
- Actual: social = Google only (GitHub off); email address, username and password are enabled as sign-in methods, password required.
- Fix: Clerk dashboard (owner) — enable GitHub; turn off password, username and email sign-in (email stays as a contact attribute from OAuth). Repeat on the production instance in R1. Then re-run Q2.1.
- Note: the username portion is fixed — see BUG-008 (plan 6 C1.3). GitHub sign-in and password/email sign-in still open.

### BUG-003 — Clerk profile fields that ihateurl ignores (P2)
- Steps: avatar menu → Manage account → Profile.
- Actual: "Update username" edits Clerk's own username, separate from the ihateurl username; "Update profile" changes the Clerk name and photo, but the ihateurl avatar was copied at onboarding (D8) and does not change.
- Fix: turning off Clerk usernames (BUG-002) removes the username row (done). Photo: kept in sync automatically now (plan 6 C2.4, `syncAvatarIfChanged`). Name: owner decision 2026-09-26 — keep Clerk's first/last name fields on; "Manage account" still lets a member edit a Clerk name ihateurl never reads. Accepted as a known issue.

### BUG-004 — Username casing after save (P2)
- Steps: Settings → username `VinayBhoure` → Save profile.
- Expected: field shows the stored value `vinaybhoure`.
- Actual: DB stores `vinaybhoure` (correct); the field keeps `VinayBhoure` until the page reloads.
- Fix: reset the form to the saved values after a successful save.

### BUG-005 — Admin page styling (P2)
- `src/app/app/admin/page.tsx` uses `bg-neutral-950`, `violet-*`, `text-neutral-*` (starter example, kept by D13). Breaks `rules/ui.md` §1. Gate works: non-admins are redirected to `/app`.
- Fix: restyle with tokens, or accept (admin-only page).

### BUG-006 — Duplicate titles in "Move to…" (P2)
- Steps: two collections titled "QA Alpha" → Move to… on a link.
- Actual: options show titles only, so same-titled collections cannot be told apart.
- Fix: show the slug next to the title when titles repeat.

---

## 3. Fixed

| ID | Area | Severity | Summary | Fixed by |
|---|---|---|---|---|
| BUG-007 | Config | P0 | Production build reads `NEXT_PUBLIC_APP_URL` as unset, falling back to `localhost:3000` for copy/share/open URLs, metadata and sitemap | Plan 6 C1.2, commit `7a9c1d6`; owner set `NEXT_PUBLIC_APP_URL` in Vercel Production and redeployed. Owner-confirmed fixed 2026-09-26. |
| BUG-008 | Auth / onboarding | P1 | Clerk sign-up asks for a username, then `/app/onboarding` asks again (double prompt) | Plan 6 C1.3; owner turned off Clerk's Username field (dev and production). Owner-confirmed fixed 2026-09-26. |
| BUG-009 | UI / dialogs | P1 | Category picker popover renders outside the dialog; dialog scroll lock blocks wheel/touch scroll of the category list | Plan 6 C2.1, commit `8ff4de1`. Browser-verified 2026-09-26: wheel scroll works, outside click keeps dialog open, Esc still closes. |
| BUG-010 | UI | P2 | Public collection/profile rows show `displayName` only; two owners with the same display name are indistinguishable | Plan 6 C2.2. Browser-verified 2026-09-26 on `/explore`: every row shows `by @username` (mono). |

### BUG-007 — Production URLs point to localhost (P0) — Fixed
- Steps: open the production site → Copy/Share/Open a link; view page source.
- Expected: production URLs use the production domain.
- Actual: `src/config/env.ts` fell back to `http://localhost:3000` because `NEXT_PUBLIC_APP_URL` was not set for the Vercel production build. Affected copy/share/open URLs, `metadataBase`, canonical, OG tags, `sitemap.xml`, `robots.txt` and the metadata-fetcher User-Agent.
- Fix: plan 6 C1.2 — `env.ts` `appUrl` now resolves `NEXT_PUBLIC_APP_URL` → Vercel's `VERCEL_PROJECT_PRODUCTION_URL` → `localhost` (dev only), failing the build with a clear error if neither is set in production (commit `7a9c1d6`); owner set `NEXT_PUBLIC_APP_URL` in Vercel Production and redeployed.

### BUG-008 — Username asked twice at sign-up (P1) — Fixed
- Steps: sign up with Google or GitHub.
- Expected: username asked once.
- Actual: Clerk's sign-up form asked for a username (Clerk username field was on), then ihateurl's own `/app/onboarding` asked again.
- Fix: plan 6 C1.3 — owner turned off Clerk's Username field (dev and production instances). Duplicate of the sign-in-method half of BUG-002 (GitHub sign-in and password/email sign-in there remain open); related to BUG-003 (separate Clerk profile fields ihateurl ignores).

### BUG-009 — Category list doesn't scroll inside form dialogs (P1) — Fixed
- Steps: open the new-collection or link-edit dialog → open the category picker with 15+ categories → try to scroll the list.
- Expected: the list scrolls with wheel or touch.
- Actual: `category-picker.tsx` rendered the popover in a portal outside the `Dialog`; the dialog's scroll lock blocked wheel/touch scroll inside the portaled list. Dialogs also closed on any outside click, so a stray click elsewhere lost form input.
- Fix: plan 6 C2.1 (commit `8ff4de1`) — the popover now portals into the dialog's own content node so it scrolls with it; `DialogContent` ignores outside pointer interactions by default (Esc still closes). Browser-verified: wheel-scrolled a 15+ item list in both the Edit Collection and Edit Link dialogs; a stray click outside the dialog no longer closes it; a click outside the open category popover closes only the popover.

### BUG-010 — Public rows don't show a stable identifier (P2) — Fixed
- Steps: two owners set the same display name → view their collections on `/explore` or a public profile row.
- Expected: rows are distinguishable regardless of display name.
- Actual: `public-collection-row.tsx` and the landing explore section showed the display name; nothing reliably showed the `@username`, so same-named owners looked identical.
- Fix: plan 6 C2.2 — `PublicCollectionRow` now always shows `by @username` (mono); the `displayName` field was dropped from its `owner` prop entirely. Browser-verified on `/explore`. Related to BUG-003 (ihateurl profile fields not synced with Clerk) — still open.
