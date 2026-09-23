# CLAUDE.md — ihateurl

Read this file fully at the start of every session. It applies to every Claude session in this repo: Claude Code, Cowork and subagents.

## Table of Contents
1. [Mandatory: session logging](#1-mandatory-session-logging)
2. [Working rules](#2-working-rules)
3. [Project](#3-project)
4. [Stack and commands](#4-stack-and-commands)
5. [Repo map](#5-repo-map)
6. [Code conventions](#6-code-conventions)
7. [Git](#7-git)
8. [Session checklist](#8-session-checklist)

---

## 1. Mandatory: session logging

Every session that reads or changes this repo MUST write two log entries before it ends. Do this even when no code changed. No exceptions.

| Folder | What goes in it | Rule source |
|---|---|---|
| `docs/tracking/ai-logs/` | What you **did** this session (actions, decisions, blockers), in 2–3 short lines | `docs/tracking/ai-logs/FILE.md` |
| `docs/tracking/logs/` | What **changed in the codebase** (files added/changed/removed + why), short change log | `docs/tracking/logs/FILE.md` |

**File name:** `YYYYMMDD.md`. Use the date in IST (Asia/Kolkata), e.g. `20260923.md`.

**Format:**
- A Table of Contents sits at the top and lists every session in the file.
- Each session is one `## Session HH:MM IST` heading. If the file for today already exists, append a new heading and update the TOC. Never overwrite earlier entries.
- If a session changed no files, the `logs/` entry says `No codebase changes.`

**Template (ai-logs):**
```markdown
# 2026-09-23

## Table of Contents
- [Session 10:15 IST](#session-1015-ist)
- [Session 16:40 IST](#session-1640-ist)

## Session 16:40 IST
- Task: <what the owner asked>
- Done: <what you did, key decisions>
- Next / blocked: <open items, questions waiting on owner>
```

**Template (logs):**
```markdown
## Session 16:40 IST
- `path/to/file.ts` — added | changed | removed: <one-line reason>
```

**When:**
1. **Session start:** read today's files, and the latest earlier file if today has none, to pick up context from the last agent.
2. **Session end:** before your final reply, write both entries.
3. **Long sessions:** also write after each finished task, so nothing is lost if the session ends early.

---

## 2. Working rules

1. **Approval gate.** No code change, file change, branch or commit without explicit owner approval: "Approve", "Proceed", "Start implementation" or "Execute the plan". Planning and questions are always allowed. Exception: the tracking logs in §1 are always allowed.
2. **No assumptions.** If a requirement, API, schema, flow or config is unclear, ask. Use only facts verified in this repo or the docs below.
3. **One task at a time.** Implement a single plan task, validate it, commit it, log it, then move on.
4. **Stay in scope.** Build only what is inside the MVP boundary (PRD §18). Do not touch unrelated code.
5. **Writing style.** Docs and plans are short and exact. Prefer tables. No filler or marketing words.
6. **markdown file rule.** For every Markdown file you generate, please maintain a table of contents at the top. 
7. **CodeGraph is deferred.** Do not install or configure CodeGraph until backend B3 is merged; setup is task B3.4 in `1_backend-mvp.md`.
8. **Architecture docs.** When a change affects layers, flows, schema, access rules, actions or terms, update the matching file in `docs/architecture/` in the same commit.

---

## 3. Project

**ihateurl** lets people save URLs into collections, keep them private, and publish selected collections at `ihateurl.com/{username}/{collection-slug}`.
Core loop: Save → Organize → Share → Maintain.

**Current state:** starter kit only. The MVP is planned, not built.

### Source of truth (read before any task)
| Doc | Purpose |
|---|---|
| `docs/prd/prd.md` | Product requirements |
| `docs/implementation-plan/0_setup-mvp.md` | Git + Claude workspace setup |
| `docs/implementation-plan/1_backend-mvp.md` | **Locked decisions D1–D15**, proposed defaults P1–P8, schema, server actions |
| `docs/implementation-plan/2_frontend-mvp.md` | Frontend decisions FD1–FD6, FP1–FP8, design system, screens |
| `docs/implementation-plan/3_polish-mvp.md` | Manual QA + release checklist |

### Architecture reference
| Doc | Read when |
|---|---|
| `docs/architecture/overview.md` | Starting any task: system context, layers, request flows, code layout |
| `docs/architecture/data-model.md` | Touching schema, queries or controllers: invariants I1–I9, delete behaviour, indexes |
| `docs/architecture/access-and-security.md` | Auth, permissions, public pages, URL fetching, user input |
| `docs/architecture/server-actions.md` | Adding or changing a mutation: contract, error codes, revalidated paths |
| `docs/architecture/glossary.md` | Any term is unclear (link vs item, remove vs delete, copy vs fork) |

If this file, an architecture doc and a plan disagree, the plan wins. Flag the conflict to the owner.

### Key decisions (full lists: D/P in `1_backend-mvp.md` §1, FD/FP in `2_frontend-mvp.md` §1)
- Auth: Clerk (Google + GitHub). DB `User.clerkId` links the DB user to the Clerk account.
- DB: PostgreSQL only via Prisma. The MongoDB switch is being removed.
- Routes: signed-in area is `/app/*`; auth pages are `/login` and `/signup`.
- A user can't save the same URL twice (`normalizedUrl`). One link can be in many collections. Removing a link from its last collection deletes the link.
- Categories: seeded system list plus user custom categories, many-to-many with collections and links.
- No Redis, queues, S3, analytics or separate backend in the MVP.
- Testing: manual QA only.

---

## 4. Stack and commands

Next.js 16 (App Router; `src/proxy.ts` replaces middleware) · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui (new-york, neutral) · lucide-react · sonner · Zod 3 · Prisma 6 · Clerk v7 · Resend + React Email.

```bash
npm run dev          # dev server
npm run build        # production build
npm run lint         # eslint
npx tsc --noEmit     # type check
npm run db:studio    # Prisma Studio
```
Planned scripts (B1.3): `db:migrate`, `db:deploy`, `db:seed`. `db:switch` and `db:push` are being removed.

Env vars: see `.env.example`. Never read or print real values from `.env`.

---

## 5. Repo map

```text
src/app/                  routes (App Router)
  app/                    signed-in area (/app, /app/admin)
  login/, signup/         Clerk pages
  api/health/             health check route
src/components/ui/        shadcn primitives
src/config/               db (Prisma singleton), env, resend
src/server/               controllers/, routers/, middleware/ (validate.ts)
src/lib/                  utils, validations/ (Zod), send-email
src/emails/templates/     React Email templates
prisma/                   schema (Postgres)
docs/                     prd, architecture, implementation-plan, tracking
.claude/                  rules, skills, agents, commands (CLAUDE.md lives at repo root)
```
Planned additions (built vs planned): `docs/architecture/overview.md` §5.

---

## 6. Code conventions

- **Auth:** every protected page, action and route calls Clerk itself (`auth.protect()` / `requireOnboardedUser()`). `proxy.ts` does not gate routes.
- **Mutations:** server actions only. Each one follows `resolve user → Zod validate → controller → revalidatePath → ActionResult`.
- **Reads:** server components call query functions. No client-side data fetching for pages.
- **Ownership:** never accept a user ID from the client. Load records with `where: { id, userId }`. If a record isn't found, or belongs to someone else, return `NOT_FOUND` in both cases.
- **Privacy:** public pages, explore and the sitemap only ever query `visibility: PUBLIC`.
- **URL fetching:** only through the SSRF-safe metadata fetcher (http/https only, timeout, size and redirect limits, private IPs blocked).
- **DB:** Prisma only. Wrap multi-row writes in `$transaction`. Change the schema only via `prisma migrate dev --name <change>`. Never edit applied migrations.
- **Validation:** Zod schemas live in `src/lib/validations/` and are shared by forms and actions.
- **UI:** shadcn primitives, lucide icons, sonner toasts. Render user text as text; never use `dangerouslySetInnerHTML`.

---

## 7. Git

- Branch from `origin/staging`: `<type>/<module>/<short-description>` (feature, fix, refactor, chore, docs).
- Conventional Commits, one logical change per commit, e.g. `feat(links): add ssrf-safe metadata fetcher`.
- Before each commit: `npm run lint`, `npx tsc --noEmit`, `npm run build`.
- Flow: branch → `staging` → manual validation → `main`. Commit or push only when the owner asks.

---

## 8. Session checklist

**Start**
- [ ] Read this file.
- [ ] Read the latest `docs/tracking/ai-logs/` and `docs/tracking/logs/` entries.
- [ ] Read the plan task you are working on.
- [ ] Read the architecture doc(s) for the area you touch.

**End**
- [ ] Task validated (lint, types, build, the task's validation line).
- [ ] Architecture docs updated if the change affects them.
- [ ] `docs/tracking/ai-logs/YYYYMMDD.md` updated.
- [ ] `docs/tracking/logs/YYYYMMDD.md` updated.
- [ ] Final reply lists open questions for the owner.
