# 0 — Setup (MVP)

Prepare git and the Claude Code workspace so every later plan is implemented the same way.

Source of truth: `docs/prd/prd.md` + the decisions table in `1_backend-mvp.md`.

Status: **Waiting for approval.** No task starts until the owner writes "Approve", "Proceed", "Start implementation" or "Execute the plan".

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

| Item | Fact (verified in repo) |
|---|---|
| Repo | `github.com/vinayBhoure/ihateurl.com`, branches: `main` (tracked), local `master` |
| Base | Starter kit: Next.js 16.3.5 (App Router, `src/proxy.ts`), Clerk v7, Prisma 6, Zod 3, Tailwind 4, shadcn (new-york, neutral), sonner, lucide, Resend |
| AI tooling | `.claude/` has empty `agents/ reference/ rules/ skills/`, empty `CLAUDE.md`, and `commands/generate-plan.md` |
| Tracking | `docs/tracking/ai-logs/` (session actions) and `docs/tracking/logs/` (code change log); file name `YYYYMMDD.md`, TOC at top, same-day sessions appended under a time subheading |
| Scope | `.claude` only. `.gemini` stays untouched |
| Testing | Manual QA only (no test framework) |

### Risks

| Risk | Detail |
|---|---|
| Dirty working tree | `git status` shows 35 modified files with equal insertions/deletions (likely CRLF/LF changes) and a deleted `docs/map.md`. Must be settled before branching. |
| Stray file | `docs/implementation-plan/.claude/settings.local.json` exists (local Claude Code settings). |

---

## 2. Clarification Questions

| Priority | Question | Why |
|---|---|---|
| High | Commit or discard the current 35-file diff and the `docs/map.md` deletion? Add `.gitattributes` (`* text=auto eol=lf`) to stop line-ending churn? | Staging must start from a clean `main`. |
| Low | Delete `docs/implementation-plan/.claude/settings.local.json` and git-ignore `**/.claude/settings.local.json`? | Local settings should not be committed. |

---

## 3. Scope Breakdown

| Epic | Feature | Task | Dependencies | Status |
|---|---|---|---|---|
| S1 Git | Clean base | S1.1 Settle working tree | Owner answer | Blocked |
| S1 Git | Branch model | S1.2 Create `staging` from `main` | S1.1 | Pending |
| S2 Claude | Project memory | S2.1 Write `CLAUDE.md` | S1.2 | Completed (repo root; `.claude/` is not writable by remote tools) |
| S2 Claude | Rules | S2.2 Write `.claude/rules/*` | S2.1 | Pending |
| S2 Claude | Reference | S2.3 Architecture reference | S2.1 | Completed (`docs/architecture/`) |
| S2 Claude | Skills | S2.4 Write `.claude/skills/*` | S2.2 | Pending |
| S2 Claude | Agents | S2.5 Write `.claude/agents/*` | S2.2 | Pending |
| S2 Claude | Commands | S2.6 Write `.claude/commands/*` | S2.2 | Pending |

---

## 4. Execution Plan

### S1.1 Settle working tree
- **Purpose:** Start from a known state.
- **Steps:** Apply the owner's answer (commit as `chore(repo): normalize line endings` or `git restore .`). Add `.gitattributes` if approved.
- **Validation:** `git status` is clean.
- **Rollback:** `git reset --hard origin/main` (only before push).

### S1.2 Create `staging`
- **Steps:** `git fetch origin && git checkout -b staging origin/main && git push -u origin staging`.
- **Rule from here on:** feature branches come from `origin/staging`; flow is `branch → staging → validation → main`.
- **Validation:** `git branch -a` shows `origin/staging`.
- **Rollback:** `git push origin --delete staging`.

### S2.1 `CLAUDE.md`
Done: written at repo root `CLAUDE.md`. Content below kept for reference.

Short file (under 120 lines). Content:
1. What ihateurl is (2 lines) + link to PRD and the four plans.
2. Stack and commands: `npm run dev`, `npm run build`, `npm run lint`, `npx tsc --noEmit`, `npm run db:migrate`, `npm run db:seed`, `npm run db:studio`.
3. Folder map (as defined in `1_backend-mvp.md` §Folder layout).
4. Working rules:
   - Read the relevant plan task before coding; implement one task at a time.
   - No code or file changes without explicit owner approval (approval words listed above).
   - Do not assume requirements — ask.
   - Update `docs/tracking/ai-logs/` and `docs/tracking/logs/` at the end of every session (format in `rules/tracking.md`).
5. Pointers to `rules/`, `reference/`, `skills/`, `agents/`, `commands/`.

### S2.2 `.claude/rules/`
| File | Content (short, imperative) |
|---|---|
| `architecture.md` | Pointer only: follow `docs/architecture/overview.md` (layers, flows) and `data-model.md` (invariants). |
| `security.md` | Pointer only: follow `docs/architecture/access-and-security.md`. |
| `data.md` | Prisma only (no raw SQL except health check). Multi-row writes in `prisma.$transaction`. Schema changes via `prisma migrate dev --name <change>`; never edit applied migrations. |
| `validation.md` | One Zod schema per input in `src/lib/validations/`, shared by forms and actions. Actions return `ActionResult<T>`. |
| `ui.md` | Filled after `2_frontend-mvp.md` is approved (design tokens, spacing, component usage). Until then: shadcn primitives in `src/components/ui`, lucide icons, sonner toasts. |
| `git.md` | Branch format `<type>/<module>/<short-description>` from `origin/staging`. Conventional Commits, one logical change per commit. Before commit: `npm run lint`, `npx tsc --noEmit`, `npm run build`. |
| `tracking.md` | Copy of the two tracking rules in `docs/tracking/*/FILE.md`, with an example entry. |

### S2.3 Architecture reference
Done: replaced by `docs/architecture/` (`overview`, `data-model`, `access-and-security`, `server-actions`, `glossary`). Nothing is written to `.claude/reference/`.

### S2.4 `.claude/skills/`
Each skill = `SKILL.md` with name, one-line description, steps, a checklist.
| Skill | Use when |
|---|---|
| `server-action` | Adding or changing a mutation. Steps: schema → controller → action → revalidate → manual check. |
| `prisma-change` | Changing `schema.prisma`. Steps: edit → `migrate dev` → update `reference/schema.md` → seed if needed. |
| `public-page` | Adding a public route. Steps: query with `visibility: PUBLIC` → `notFound()` otherwise → `generateMetadata` → sitemap check. |
| `ui-component` | Filled after frontend plan approval. |

### S2.5 `.claude/agents/`
| Agent | Role | Tools |
|---|---|---|
| `code-reviewer` | Reviews a diff against `rules/`. Reports issues only; no edits. | Read, Grep, Glob, Bash (git diff) |
| `security-reviewer` | Checks ownership checks, private-data leaks, SSRF guard, input validation on a diff. | Read, Grep, Glob |
| `qa-checker` | Walks the manual QA checklist in `3_polish-mvp.md` for a given area and reports pass/fail. | Read, Bash |

### S2.6 `.claude/commands/`
| Command | Does |
|---|---|
| `generate-plan.md` | Existing. Keep as is. |
| `implement-task.md` | `/implement-task <plan-file> <task-id>`: read task → confirm approval → implement → validate → commit → update tracking logs. |
| `review.md` | `/review`: run `code-reviewer` + `security-reviewer` on current branch diff vs `staging`. |
| `log-session.md` | `/log-session`: write today's entries in both tracking folders. |

**Validation for S2.x:** files exist, each under ~150 lines, no contradictions with PRD or decisions; open a fresh Claude Code session and confirm `/implement-task`, `/review`, `/log-session` are listed.
**Rollback:** revert the `chore(claude)` commits.

---

## 5. Git Plan

Branch: `chore/claude/ai-workspace` (from `origin/staging`)

```text
chore(repo): normalize line endings            # only if approved in S1.1
chore(claude): add CLAUDE.md
chore(claude): add rules
docs(architecture): add architecture reference
chore(claude): add skills
chore(claude): add agents and commands
docs(tracking): log setup session
```

Merge: branch → `staging` → `main`.

---

## 6. Testing Plan

Manual only:
- `git status` clean after each commit; `staging` exists on origin.
- New Claude Code session loads `CLAUDE.md`, lists new commands and agents.
- Dry run: `/implement-task 1_backend-mvp.md B1.1` stops at the approval gate.
