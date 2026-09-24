---
description: Execute one approved task from an implementation plan
argument-hint: <plan-file> [task-id]   e.g. 1_backend-mvp.md B3.2
---

# /execute-plan

Execute **one** task from `docs/implementation-plan/$ARGUMENTS`.

## Table of Contents
1. [Before starting](#1-before-starting)
2. [Execute](#2-execute)
3. [Finish](#3-finish)
4. [Stop when](#4-stop-when)

---

## 1. Before starting

1. Read `CLAUDE.md`, the plan file, the latest `docs/tracking/` entries, and any `docs/tracking/mistakes/` entries related to the task.
2. Confirm the owner approved this plan in this chat ("Approve", "Proceed", "Start implementation", "Execute the plan"). No approval → stop and ask.
3. Pick the task:
   - task ID given → that task;
   - no ID → first `Pending` task in the Scope Breakdown whose dependencies are `Completed`.
   - Never pick `Blocked` or `Deferred` tasks.
4. Read the architecture docs the task touches (`docs/architecture/`).
5. Branch from `origin/staging` using the name in the plan's Git Plan. `staging` missing → stop and ask.

## 2. Execute

1. Implement only what the task lists. No extra features, no unrelated edits.
2. Follow `CLAUDE.md` §6 conventions and `docs/architecture/`.
3. Anything unclear or not in the plan → stop and ask. Do not guess.

## 3. Finish

1. Run `npm run lint`, `npx tsc --noEmit`, `npm run build`, then the task's **Validation** steps. Fix failures before continuing.
2. Set the task's status to `Completed` in the plan's Scope Breakdown.
3. Update `docs/architecture/` if the change affects it.
4. Commit with Conventional Commits (one logical change per commit). Do not push or merge unless the owner asks.
5. Write both tracking logs (`CLAUDE.md` §1). If a failure in step 1 or during execution came from your own mistake, also log it in `docs/tracking/mistakes/`.
6. Report: what changed, validation results, next task, open questions. Then stop.

## 4. Stop when

- Validation fails and the fix is outside the task.
- A decision, credential, or manual step (Clerk, DB, env) is needed from the owner.
- The task conflicts with the PRD, a plan, or `docs/architecture/`.
