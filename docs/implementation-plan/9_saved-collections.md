# 9 — Saved Collections (bookmark, not copy)

Replace "Save to my collections" (copies the collection and all its links) with a bookmark that points to the owner's collection. Saved collections appear in a new **Saved collections** tab on `/app`.

Status: **Approved** (owner, 2026-09-27: `/execute-plan`). Q1–Q2 answered (owner, 2026-09-27).
Depends on: nothing. Runs before plan 5 (Prisma upgrade).

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

### Owner decisions (2026-09-27)
| # | Decision |
|---|---|
| O1 | Saving stores a reference only. No links or collection data are copied. |
| O2 | Owner deletes the collection → it disappears from everyone's Saved list automatically. |
| O3 | Existing copies stay as the users' own collections (no migration of data). |
| O4 | Saved collection turned private → hidden from Saved, not removed; shown again if made public. |
| O5 | "Allow others to save" off → blocks new saves only; existing saves stay. |
| O6 | `/app/search` stays limited to the user's own collections. |
| O7 | `/app` gets tabs **My collections** / **Saved collections** (owner's screenshot). |

### Verified in code (`main` at `01a76b9`)
| Item | Fact |
|---|---|
| Copy flow | `copyCollection` action (`src/server/actions/collection.ts`) → `src/server/controllers/copy.controller.ts`; schema `copyCollectionSchema`; `RATE_LIMITS.copyCollection`. |
| UI | `SaveBookmarkButton` (cards) and `SaveCollectionButton` (collection page) call `copyCollection`. |
| Saved state | `listSavedSourceIds` reads copies by `sourceCollectionId`; used on `/`, `/explore`, `/u/[username]`. |
| Setting | `Collection.allowCopy` (default `true`); dialog label "Allow others to save a copy". |
| Docs mentioning copies | Terms (`/terms`), PRD "Save Collection", feature list 2.16, architecture docs, glossary. |

### Risks
| Risk | Mitigation |
|---|---|
| Migration overlaps plan 5 (Prisma upgrade) | Never run in parallel (Q1). |
| Private collection data leaking through Saved | Saved query filters `visibility: PUBLIC` at read time; collection page already 404s private. |
| Toggle spam | Rate limit on save/unsave. |

---

## 2. Design

### 2.1 Data
```prisma
model SavedCollection {
  userId       String
  collectionId String
  createdAt    DateTime   @default(now())
  user         User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  collection   Collection @relation(fields: [collectionId], references: [id], onDelete: Cascade)
  @@id([userId, collectionId])
  @@index([collectionId])
}
```
- `User.savedCollections`, `Collection.savedBy` back-relations.
- `Collection.allowCopy` keeps its column name (no rename migration); meaning becomes "allow new saves". UI label "Allow others to save".
- `sourceCollectionId` / `copiedAt` stay for existing copies (O3); no new copies are created.

### 2.2 Rules
| Action | Allowed when | Result |
|---|---|---|
| Save | Member; collection `PUBLIC`; `allowCopy = true`; not own | Row created (idempotent: saving twice keeps one row) |
| Unsave | Member; row exists | Row deleted (works even if the collection is now private or `allowCopy = false`) |
| Owner deletes collection | — | Rows removed by cascade (O2) |
| Owner makes collection private | — | Row kept, hidden from Saved (O4) |
| Owner turns off "Allow others to save" | — | Existing rows kept; new saves refused (O5) |

### 2.3 Actions (`src/server/actions/saved.ts`)
- `saveCollection({ collectionId })` → `NOT_FOUND` when not public, not allowed or own; `RATE_LIMITED`.
- `unsaveCollection({ collectionId })` → deletes the viewer's row; `NOT_FOUND` if none.
- Both: member only, rate limit `saveCollection` 30/min/user, revalidate `/app/saved`.

### 2.4 UI
| Place | Change |
|---|---|
| `SaveBookmarkButton` (cards) | Toggle. Save → toast "Saved to your collections" + "Open" (`/app/saved`); filled icon. Click again → unsave → toast "Removed from saved". Hidden for own collection; hidden when `allowCopy = false` and not already saved. |
| `SaveCollectionButton` (collection page) | Same toggle as a text button: "Save" / "Saved". Stays on the page. |
| `/app` | Page title "Collections"; tabs **My collections** (`/app`) and **Saved collections** (`/app/saved`) as links with `aria-current`; "New collection" stays on the right. |
| `/app/saved` | `CollectionCard` grid (creator shown, bookmark in saved state), newest save first; empty state "Nothing saved yet" + "Explore" link; loading skeleton. |
| Edit collection dialog | Switch label "Allow others to save". |

---

## 3. Clarification Questions

| Priority | # | Question | Default if confirmed |
|---|---|---|---|
| High | Q1 | Run before or after plan 5 (Prisma upgrade)? Both add migrations. | **Answered:** plan 9 runs first |
| Low | Q2 | Tab routes `/app` and `/app/saved` (linkable pages) instead of a query param? | **Answered:** yes |

---

## 4. Scope Breakdown

| Task | Purpose | Dependencies | Status |
|---|---|---|---|
| G1 Schema + migration | `SavedCollection` table | — | Completed |
| G2 Actions + queries | Save/unsave; saved ids; saved list | G1 | Pending |
| G3 Bookmark + collection page toggle | Replace copy calls in UI | G2 | Pending |
| G4 `/app` tabs + `/app/saved` page | Show saved collections | G2 | Pending |
| G5 Remove copy code | Delete copy action, controller, schema, rate limit, `listSavedSourceIds` | G3 | Pending |
| G6 Docs | PRD, Terms, architecture, glossary, feature list | G3–G5 | Pending |

Critical path: G1 → G2 → G3 → G5 → G6. Parallel: G3 ∥ G4.

---

## 5. Execution Plan

Every code task ends with `npm run lint`, `npx tsc --noEmit`, `npm run build` and its Validation line. Rollback: revert the task's commit; G1 has a down migration (drop table).

**G1 Schema + migration** — §2.1; `npx prisma migrate dev --name saved_collections`.
Validation: table exists; deleting a collection deletes its saved rows; deleting a user deletes their saved rows.

**G2 Actions + queries**
- `src/lib/validations/saved.ts` (`collectionId` cuid), `src/server/controllers/saved.controller.ts`, `src/server/actions/saved.ts` (§2.3).
- `src/server/queries/collections.ts`: `listSavedCollectionIds(userId, ids)` (replaces `listSavedSourceIds` on `/`, `/explore`, `/u/[username]`); `listMySavedCollections(userId)` → saved rows where `collection.visibility = PUBLIC`, card data (`cardSelect`) + owner, ordered by save date desc.
- `docs/architecture/server-actions.md`, `access-and-security.md` (§2.2 rules).
Validation: every row of §2.2 via direct action calls; private saved collection absent from the list and present again after making it public.

**G3 Bookmark + collection page toggle** (`save-bookmark-button.tsx`, `save-collection-button.tsx`, `/u/[username]/[slug]/[publicId]/page.tsx`)
- §2.4; collection page reads saved state for the viewer.
Validation: save → toast → filled; unsave → outline; no new collection or links created in the saver's account; signed-out → sign-in; own collection → hidden.

**G4 `/app` tabs + `/app/saved`**
- `src/components/collection-tabs.tsx` (reusable, link tabs); `src/app/app/(shell)/page.tsx` uses it; new `src/app/app/(shell)/saved/page.tsx` + `loading.tsx`.
- App nav "Collections" active for both tabs.
Validation: tabs switch by URL; keyboard + `aria-current`; saved list matches §2.2; empty state; 360/768/1280, light and dark.

**G5 Remove copy code**
- Delete `copyCollection` action, `copy.controller.ts`, `copyCollectionSchema`, `RATE_LIMITS.copyCollection`, `listSavedSourceIds`.
- Edit dialog label "Allow others to save".
Validation: `grep copyCollection` finds nothing in `src/`; existing copies still open and edit normally.

**G6 Docs**
- `docs/prd/prd.md` §Save Collection: bookmark, no copy, rules §2.2.
- Terms (`/terms`): "letting other users save copies" → "letting other users save them to their Saved list"; update "Last updated".
- `docs/architecture/data-model.md` (model, delete behaviour, invariants), `glossary.md` (Save vs Copy), `docs/prd/feature-list.md` 2.16.
Validation: statements match behaviour.

---

## 6. Git Plan

Branch `feature/collections/saved` from `origin/staging`.

```text
feat(db): add saved collections table
feat(collections): add save and unsave actions
feat(ui): turn save buttons into save toggles
feat(app): add saved collections tab
refactor(collections): remove copy collection flow
docs: document saved collections
```

Merge: branch → `staging` → validation → `main`.

---

## 7. Testing Plan (manual)

| Area | Checks |
|---|---|
| Save / unsave | Cards (Explore, landing, profile) and collection page; toasts; state after reload |
| Rules | Own collection, private, `allowCopy` off (new save refused, existing kept), owner deletes (gone), private then public again (hidden then back) |
| Data | No collection or link rows created on save |
| `/app` | Tabs, saved grid, empty state, loading, responsive, light/dark |
| Regression | Existing copies, My collections, search, Explore bookmarks, back links |
