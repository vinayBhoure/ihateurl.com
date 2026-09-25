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
| BUG-007 | Config | P0 | Production build reads `NEXT_PUBLIC_APP_URL` as unset, falling back to `localhost:3000` for copy/share/open URLs, metadata and sitemap | Owner production review, 2026-09-26 | Open — plan 6 C1.2 |
| BUG-008 | Auth / onboarding | P1 | Clerk sign-up asks for a username, then `/app/onboarding` asks again (double prompt) | Owner production review, 2026-09-26 | Open — plan 6 C1.3, see BUG-002 |
| BUG-009 | UI / dialogs | P1 | Category picker popover renders outside the dialog; dialog scroll lock blocks wheel/touch scroll of the category list | Owner production review, 2026-09-26 | Open — plan 6 C2.1 |
| BUG-010 | UI | P2 | Public collection/profile rows show `displayName` only; two owners with the same display name are indistinguishable | Owner production review, 2026-09-26 | Open — plan 6 C2.2, see BUG-003 |

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

### BUG-003 — Clerk profile fields that ihateurl ignores (P2)
- Steps: avatar menu → Manage account → Profile.
- Actual: "Update username" edits Clerk's own username, separate from the ihateurl username; "Update profile" changes the Clerk name and photo, but the ihateurl avatar was copied at onboarding (D8) and does not change.
- Fix: turning off Clerk usernames (BUG-002) removes the username row. Photo and name: accept as known issue, or copy the photo on sign-in (new behaviour — owner decision).

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

### BUG-007 — Production URLs point to localhost (P0)
- Steps: open the production site → Copy/Share/Open a link; view page source.
- Expected: production URLs use the production domain.
- Actual: `src/config/env.ts` falls back to `http://localhost:3000` because `NEXT_PUBLIC_APP_URL` is not set for the Vercel production build. Affects copy/share/open URLs, `metadataBase`, canonical, OG tags, `sitemap.xml`, `robots.txt` and the metadata-fetcher User-Agent.
- Fix: plan 6 C1.2 — set `NEXT_PUBLIC_APP_URL` in Vercel Production and redeploy; fall back to Vercel's `VERCEL_PROJECT_PRODUCTION_URL` in code, `localhost` only outside production.

### BUG-008 — Username asked twice at sign-up (P1)
- Steps: sign up with Google or GitHub.
- Expected: username asked once.
- Actual: Clerk's sign-up form asks for a username (Clerk username field is on), then ihateurl's own `/app/onboarding` asks again.
- Fix: plan 6 C1.3 — turn off Clerk's Username field (dev and production instances). Duplicate of the sign-in-method half of BUG-002; related to BUG-003 (separate Clerk profile fields ihateurl ignores).

### BUG-009 — Category list doesn't scroll inside form dialogs (P1)
- Steps: open the new-collection or link-edit dialog → open the category picker with 15+ categories → try to scroll the list.
- Expected: the list scrolls with wheel or touch.
- Actual: `category-picker.tsx` renders the popover in a portal outside the `Dialog`; the dialog's scroll lock blocks wheel/touch scroll inside the portaled list. Dialogs also close on any outside click, so a stray click elsewhere loses form input.
- Fix: plan 6 C2.1 — portal the popover into the dialog content so it scrolls; ignore outside clicks on the dialog (close via ✕, Cancel or Esc only).

### BUG-010 — Public rows don't show a stable identifier (P2)
- Steps: two owners set the same display name → view their collections on `/explore` or a public profile row.
- Expected: rows are distinguishable regardless of display name.
- Actual: `public-collection-row.tsx` and the landing explore section show the display name; nothing reliably shows the `@username`, so same-named owners look identical.
- Fix: plan 6 C2.2 — show `by @username` (mono) on every row; display name is never used as the identifier. Related to BUG-003 (ihateurl profile fields not synced with Clerk).

---

## 3. Fixed

None yet.
