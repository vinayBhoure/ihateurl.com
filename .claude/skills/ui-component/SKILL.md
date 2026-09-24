---
name: ui-component
description: Building a UI component or screen. Use when adding or changing a component in src/components, a page or layout in src/app, or a shadcn primitive.
---

# ui-component

Follow `.claude/rules/ui.md` and `docs/implementation-plan/2_frontend-mvp.md` §4–§5.

## Table of Contents
1. [Use when](#use-when)
2. [Steps](#steps)
3. [Checklist](#checklist)

## Use when
Adding or changing a UI component or screen.

## Steps
1. **Reuse** — look in `src/components/` first (`PageHeader`, `EmptyState`, `ErrorState`, `SubmitButton`, `CopyButton`, `ShareButton`, `Favicon`, `VisibilityBadge`, `ThemeToggle`) and in `src/components/ui/`.
2. **Primitives** — missing one? `npx shadcn@latest add <name>`, then the post-steps in `rules/ui.md` §5 (keep our `button.tsx`, fix `cn` import, retune).
3. **Server first** — server component by default; `"use client"` only for state, effects or handlers. Pages read data through `src/server/queries/`, never Prisma.
4. **Forms** — `useActionForm` + the shared Zod schema from `src/lib/validations/`; `SubmitButton`; inline `fieldErrors`; `AlertDialog` for destructive actions.
5. **States** — `loading.tsx` (`Skeleton`), `EmptyState`, `error.tsx` (`ErrorState onRetry={retry}`).
6. **Look** — check 360 / 768 / 1280 px and Light / Dark.
7. **Keyboard** — tab through every action; Esc closes dialogs and menus; focus is always visible.

## Checklist
- [ ] Token classes only; no raw colors or hex
- [ ] Icon-only buttons have `aria-label` + `Tooltip`
- [ ] Focus visible on every interactive element
- [ ] Targets ≥ 44 px below 768 px
- [ ] No layout shift from images (fixed sizes)
- [ ] User text rendered as text; external links use the right `rel`
- [ ] `rules/ui.md` followed
