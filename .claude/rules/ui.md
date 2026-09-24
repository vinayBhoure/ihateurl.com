# UI

Source: `docs/implementation-plan/2_frontend-mvp.md` §4–§5 (Quiet Index). If this file and the plan disagree, the plan wins.

## Table of Contents
1. [Color](#1-color)
2. [Type](#2-type)
3. [Spacing, radius, shadow](#3-spacing-radius-shadow)
4. [Icons](#4-icons)
5. [Components](#5-components)
6. [Forms](#6-forms)
7. [Screen states](#7-screen-states)
8. [Content and links](#8-content-and-links)
9. [Accessibility and responsive](#9-accessibility-and-responsive)
10. [Before commit](#10-before-commit)

---

## 1. Color
- Token utilities only (`bg-background`, `text-muted-foreground`, `border`, `bg-accent`, `text-destructive`, `bg-success` …), defined in `src/app/globals.css`.
- No raw palette classes (`neutral-*`, `violet-*`, `text-white`) and no inline hex in app code. Destructive fills use `text-background`.
- `success` only for "username available" and the Public badge dot.
- Monochrome: no hue accent, borders over shadows.

## 2. Type
| Role | Classes | Use |
|---|---|---|
| display | `text-4xl md:text-5xl font-semibold tracking-[-0.025em]` | Landing h1 only |
| h1 | `text-2xl font-semibold tracking-[-0.015em]` | Page title (use `PageHeader`) |
| h2 | `text-xl font-semibold` | Section titles |
| body | `text-base` | Descriptions, bio |
| ui | `text-sm` (`font-medium` for emphasis) | Rows, buttons, inputs, nav |
| caption | `text-xs` | Counts, dates, domain |

- One `h1` per page. `font-mono` only for URLs, domains, slugs and `ihateurl.com/…` previews.

## 3. Spacing, radius, shadow
- Gaps: 4, 8, 12, 16, 24, 32, 48, 64, 96 px (`gap-1` … `gap-24`).
- Page padding `px-4 md:px-6`. Width: app and public pages `max-w-3xl`; landing and explore `max-w-5xl`. Landing sections `py-16 md:py-24`.
- List rows: `min-h-11`, `divide-y` / `border` dividers, `hover:bg-accent`.
- Radius: `rounded-md` buttons, inputs, badges; `rounded-lg` cards, popovers, menus; `rounded-xl` dialogs, sheets.
- Shadow: none on cards and controls; `shadow-sm` popovers/menus; `shadow-lg` dialogs/sheets. Nothing else.

## 4. Icons
- `lucide-react` only. `size-4` default, `size-3.5` in badges. Mapping: plan §4.4.
- Icon-only buttons: `aria-label` + `Tooltip` (see `CopyButton`, `ThemeToggle`).

## 5. Components
- Primitives: `src/components/ui/` (shadcn, already retuned: focus ring, radius, shadow, 44 px mobile sizes). Use them as they are; don't restyle per screen.
- New primitive: `npx shadcn@latest add <name>` — never hand-written. Then:
  1. decline overwriting `button.tsx` (ours is kept);
  2. rewrite `import { cn } from "cn"` → `from "@/lib/utils"` and `npm uninstall cn` (plan R7);
  3. apply the retune: focus ring (§9), radius/shadow (§3), `min-h-11 md:min-h-0` on menu rows, no `shadow-xs`.
- Reuse the kit in `src/components/` before writing new UI: `PageHeader`, `EmptyState`, `ErrorState`, `SubmitButton`, `CopyButton`, `ShareButton`, `Favicon`, `VisibilityBadge`, `ThemeToggle`.
- Server components by default; `"use client"` only for state, effects or handlers.

## 6. Forms
- Schema from `src/lib/validations/*`; never redefined in UI.
- `useActionForm({ schema, action, successMessage, onSuccess })` (`src/hooks/`): client `safeParse` → action in a transition → `ActionResult`. It sends raw values, toasts `error` on `{ ok: false }` and ignores double submits.
- Show `fieldErrors[name][0]` under each input; set `aria-invalid` and `aria-describedby`. Inputs keep their values on error.
- Submit with `SubmitButton pending={pending}`; disable Enter-to-submit while pending.
- On success: toast, close the dialog or reset the input; `router.refresh()` only if the action did not revalidate the current path.
- URL inputs: `ensureScheme()` (`src/lib/url/`) before submit (FD4).
- Destructive actions go through `AlertDialog` stating the exact effect ("Deletes the link from every collection").

## 7. Screen states
Every data screen ships all three:
- Loading: `loading.tsx` with `Skeleton` rows.
- Empty: `EmptyState` (icon, title, one line, optional action).
- Error: `error.tsx` → `<ErrorState onRetry={retry} />` (Next 16.3 passes `retry`, not `reset`). No error details shown.

## 8. Content and links
- Render user text as text. Never `dangerouslySetInnerHTML`.
- Long titles `truncate` or `break-words`; URLs `break-all`.
- External links: `target="_blank" rel="noopener noreferrer"`; outbound links to saved URLs on public pages add `nofollow ugc` (Q3).
- Favicons and other hotlinked images: `Favicon` (plain `<img>`, fixed size, lazy, `no-referrer`, globe fallback). No `next/image` for external hosts.

## 9. Accessibility and responsive
- Every input has a `<Label>`. Every action reachable by keyboard; dialogs/menus via Radix.
- Focus: `focus-visible:ring-2 ring-ring ring-offset-2 ring-offset-background` (primitives already have it; custom controls must match).
- Targets ≥ 44 px below 768 px (primitives: `h-11 md:h-9`). Up/down buttons disabled at list ends.
- AA contrast in both themes (text ≥ 4.5:1, UI ≥ 3:1).
- Motion: only `animate-spin` on pending. No animation library (`tw-animate-css` is not installed; Radix enter/exit classes are inert).
- Widths 360 / 768 / 1280: single column at 360, no horizontal scroll; shell nav moves into a `Sheet` below 768.
- Skip link "Skip to content" → `#main` in public and shell layouts.

## 10. Before commit
- Check Light and Dark (and System), and 360 / 768 / 1280.
- Keyboard walk through the changed screen.
- `npm run lint`, `npx tsc --noEmit`, `npm run build`.
