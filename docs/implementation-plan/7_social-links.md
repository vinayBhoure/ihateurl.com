# 7 — Social Links

Social links set in `/app/settings`, shown as an icon row on the public profile `/u/{username}`.

Status: **Approved** (owner, 2026-09-26: `/execute-plan`; Q1–Q4 answered in §3).

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
| O1 | Settings: new "Social links" section right after "Profile". |
| O2 | Default fields: YouTube, Instagram, X, GitHub, LinkedIn — each a fixed URL prefix + username. |
| O3 | Extra rows: platform dropdown (Website, Other) + full URL + add (✓) button; ✕ removes a row. |
| O4 | A platform shows on the profile only when its field is filled. |
| O5 | Settings shows a live preview of the full link under each filled field. |
| O6 | Shown on `/u/{username}` only, between the bio and "Public collections". |
| O7 | Reusable components. |

### Verified in code
| Item | Fact |
|---|---|
| Settings | `src/app/app/(shell)/settings/page.tsx`: sections Profile → Categories → Appearance via local `Section`. |
| Profile save | `updateProfile` (`src/server/actions/profile.ts`) revalidates `/app/settings`, `/u/{username}`. |
| Public read | `getPublicProfile` in `src/server/queries/public.ts` selects fields explicitly. |
| Profile page | `src/app/(public)/u/[username]/page.tsx`: header (avatar, name, @username, bio, copy/share) → collections. |
| Icons | `lucide-react ^0.400`; lucide's brand icons are deprecated. |
| Working tree | Logo + UserBadge changes committed (`2598a09`), on `staging` and `main` (Q1). |

### Risks
| Risk | Mitigation |
|---|---|
| Wrong or unsafe URLs on public profile | URLs built server-side from validated handles; extra links `https` only. |
| Migration overlaps plan 5 (Prisma upgrade) | Never run in parallel (Q2). |
| Brand icon licensing | Official marks used only to link to that platform; source per §2.4. |

---

## 2. Design

### 2.1 Platforms (single source: `src/lib/social-platforms.ts`, shared by form, action and page)
| Platform | Prefix (shown) | Stored value | Pattern | Max |
|---|---|---|---|---|
| YOUTUBE | `youtube.com/@` | handle | `[A-Za-z0-9._-]{3,30}` | 1 |
| INSTAGRAM | `instagram.com/` | handle | `[A-Za-z0-9._]{1,30}` | 1 |
| X | `x.com/` | handle | `[A-Za-z0-9_]{1,15}` | 1 |
| GITHUB | `github.com/` | username | `[A-Za-z0-9-]{1,39}`, no leading `-` | 1 |
| LINKEDIN | `linkedin.com/in/` | profile id | `[A-Za-z0-9-]{3,100}` | 1 |
| WEBSITE | — | full URL | `https://`, ≤ 200 chars | 1 |
| OTHER | — | full URL | `https://`, ≤ 200 chars | 3 |

- Input cleanup: trim; strip a leading `@`; if the user pastes the full URL for that platform, strip the prefix.
- Extra rows (WEBSITE + OTHER) total ≤ 3.
- `buildUrl(platform, value)` → `https://{prefix}{value}` or the stored URL. Used for preview and profile.

### 2.2 Data
```prisma
enum SocialPlatform { YOUTUBE INSTAGRAM X GITHUB LINKEDIN WEBSITE OTHER }

model SocialLink {
  id        String         @id @default(cuid())
  userId    String
  platform  SocialPlatform
  value     String
  position  Int
  user      User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime       @default(now())
  updatedAt DateTime       @updatedAt
  @@index([userId, position])
}
```
`User.socialLinks SocialLink[]`. "One per named platform" is enforced by the action (full-set replace in one transaction).

### 2.3 Action
`updateSocialLinks({ links: { platform, value }[] })` — member only; Zod per §2.1; empty values dropped; transaction: `deleteMany({ userId })` → `createMany` with `position` = input order; revalidate `/app/settings`, `/u/{username}`. Errors: `VALIDATION` (field-level).

### 2.4 Reusable components
| Component | Type | Purpose |
|---|---|---|
| `SocialIcon` (`src/components/social-icon.tsx`) | server | One platform icon, `currentColor`. Brand marks as inline SVG from Simple Icons (CC0) or the platform's brand kit where Simple Icons has none; lucide `Globe` (Website), `Link` (Other). |
| `SocialLinks` (`src/components/social-links.tsx`) | server | Props `{ links: { platform, url }[], ownerName }`. Icon buttons, `aria-label` + tooltip "`{ownerName}` on GitHub" (Other: domain), `target="_blank" rel="me nofollow ugc noopener noreferrer"`, 44 px target < 768 px, muted → foreground on hover. Renders nothing when `links` is empty. |
| `PrefixedInput` (`src/components/prefixed-input.tsx`) | client | Input with a fixed mono prefix (`github.com/` + field); forwards input props, `aria-describedby` for errors/preview. |
| `SocialLinksForm` (`src/components/social-links-form.tsx`) | client | Settings section form (§5 S7.5). |

### 2.5 Profile placement
Inside the header's text column, under the bio (aligned with name and bio), `pt-2`. Collections move down. No row when no links.

---

## 3. Clarification Questions

| Priority | # | Question | Answer (2026-09-26) |
|---|---|---|---|
| High | Q1 | Uncommitted logo + UserBadge changes on `main`: commit them (own branch → staging → main) before this plan starts? | Done: committed `2598a09`, on `staging` and `main` |
| High | Q2 | Run after plan 5 (Prisma upgrade) or before? Both add migrations. | Now, on Prisma 6 (plan 5 not started) |
| Low | Q3 | Profile row placement per §2.5 (under bio, aligned with name)? | Yes |
| Low | Q4 | Label "X" with tooltip "X (Twitter)"? | Yes: settings "X", profile "{name} on X (Twitter)" |

---

## 4. Scope Breakdown

| Task | Purpose | Dependencies | Status |
|---|---|---|---|
| S7.1 Schema + migration | `SocialPlatform`, `SocialLink` | Q1, Q2 | Completed |
| S7.2 Platform config + Zod | §2.1 rules, `buildUrl` | — | Completed |
| S7.3 Action + queries | `updateSocialLinks`; settings read; public read | S7.1, S7.2 | Completed |
| S7.4 Reusable components | `SocialIcon`, `SocialLinks`, `PrefixedInput` | S7.2 | Pending |
| S7.5 Settings section | `SocialLinksForm` | S7.3, S7.4 | Pending |
| S7.6 Profile row | `SocialLinks` on `/u/{username}` | S7.3, S7.4 | Pending |
| S7.7 Docs + Privacy Notice | Keep docs true | S7.5, S7.6 | Pending |

Critical path: S7.1 → S7.3 → S7.5 / S7.6 → S7.7. Parallel: S7.2 ∥ S7.4 with S7.1.

---

## 5. Execution Plan

Every code task ends with `npm run lint`, `npx tsc --noEmit`, `npm run build` and its Validation line. Rollback: revert the task's commits; S7.1 also has a down migration (drop table + enum).

**S7.1 Schema + migration** — Add §2.2 to `prisma/schema.prisma`; `npx prisma migrate dev --name social_links`.
Validation: table and enum exist; deleting a user cascades its links.

**S7.2 Platform config + Zod** — `src/lib/social-platforms.ts` (platform list, prefix, pattern, max, `normalizeHandle`, `buildUrl`); `src/lib/validations/social.ts` (`socialLinksSchema`: array ≤ 8, per-platform pattern, WEBSITE/OTHER `https` ≤ 200, counts per §2.1).
Validation: `@octocat`, `octocat`, `https://github.com/octocat` → `octocat`; `javascript:…`, `http://…`, 16-char X handle rejected.

**S7.3 Action + queries**
- `src/server/controllers/social.controller.ts` + `updateSocialLinks` in `src/server/actions/profile.ts` (§2.3).
- `listMySocialLinks(userId)` for settings; `getPublicProfile` adds `socialLinks { platform, value }` ordered by `position`, mapped to `{ platform, url }` with `buildUrl` (raw values never rendered as links).
- Update `docs/architecture/server-actions.md`.
Validation: two GitHub entries or four extra links → `VALIDATION`; save replaces the full set; another user's data untouched.

**S7.4 Reusable components** — §2.4 `SocialIcon`, `SocialLinks`, `PrefixedInput`.
Validation: icons crisp at 16/20 px in light and dark; empty `links` renders nothing; keyboard focus ring visible.

**S7.5 Settings section** (`settings/page.tsx` + `SocialLinksForm`)
- Section "Social links" after "Profile".
- Five `PrefixedInput` rows (YouTube, Instagram, X, GitHub, LinkedIn); under each filled field a muted mono preview `https://…` (O5); none when empty.
- Extra rows: `Select` (Website, Other) + URL input + ✓ add; added rows show preview and ✕ remove; add disabled at 3 extra rows or when Website already used.
- One **Save** button (`useActionForm`); inline field errors + toast; inputs keep values on error.
Validation: fill GitHub → preview `https://github.com/vinaybhoure`; clear → preview gone and icon removed after save; limits enforced in UI and server.

**S7.6 Profile row** (`/u/[username]/page.tsx`) — `<SocialLinks links={profile.socialLinks} ownerName={name} />` per §2.5.
Validation: only filled platforms show (O4); order = saved order; links open the right URL in a new tab; 360 px wraps without overflow; no row for users without links.

**S7.7 Docs + Privacy Notice**
- Privacy Notice "What is public": social links on your profile are public; update "Last updated".
- `docs/prd/prd.md` §User Profile: add social links.
- `docs/architecture/data-model.md` (model, delete behaviour), `access-and-security.md` (URL rules), `glossary.md` (social link).
Validation: statements match behaviour.

---

## 6. Git Plan

Branch `feature/profile/social-links` from `origin/staging` (after Q1).

```text
feat(db): add social links table
feat(profile): add social platform config and validation
feat(profile): add update social links action
feat(ui): add social icon, social links and prefixed input components
feat(settings): add social links section
feat(public): show social links on profile
docs: document social links and update privacy notice
```

Merge: branch → `staging` → validation → `main`.

---

## 7. Testing Plan (manual)

| Area | Checks |
|---|---|
| Settings | Each platform: handle, `@handle`, pasted full URL; preview appears/disappears; add/remove extra rows; limits; save + reload keeps values |
| Profile | Only filled platforms; order; correct URLs; tooltip + screen-reader names; light/dark; 360/768/1280 |
| Security | Invalid schemes rejected server-side (direct action call); another user's links unchanged |
| Regression | Profile form, categories, appearance; `/u/{username}` copy/share and collections list |
