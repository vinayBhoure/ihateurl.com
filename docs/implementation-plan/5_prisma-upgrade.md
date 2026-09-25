# 5 — Prisma Upgrade

Upgrade Prisma ORM from 6.19.3 with no change in app behaviour. Staged: 6 → 7 (stable) first; 7 → 8 once Prisma 8 is stable.

Depends on: `4_polish-mvp.md` R1 (`v0.1.0` released). Runs after the first production release.
Status: **Approved** (owner, 2026-09-25: "Yes", recommended answers to all §2 questions). Starts after plan 4 R1. Research: 2026-09-25 (session `implementation-4`).

## Table of Contents
1. [Current Understanding](#1-current-understanding)
2. [Clarification Questions](#2-clarification-questions)
3. [Scope Breakdown](#3-scope-breakdown)
4. [Execution Plan](#4-execution-plan)
5. [Git Plan](#5-git-plan)
6. [Testing Plan](#6-testing-plan)

---

## 1. Current Understanding

### Confirmed (verified in repo and npm, 2026-09-25)
| Item | Fact |
|---|---|
| Installed | `prisma` + `@prisma/client` 6.19.3; generator `prisma-client-js` (client in `node_modules`); `url = env("DATABASE_URL")` in `schema.prisma`; seed in `package.json#prisma` (build warns: removed in Prisma 7). |
| Releases | Latest stable: 7.10.0 (2026-08-25). Prisma 8: only `8.0.0-rc.17` on npm (the `latest` tag points at the RC); prisma.io docs already default to 8. |
| Advisory | GHSA-ggr8-5vv4-36mx (`deepmerge-ts` < 8): 6.19.3 and 7.10.0 both pin 7.1.5 via `@prisma/config`. Closed today by `overrides` `deepmerge-ts ^8.0.2` (plan 4 Q1). |
| Database | Neon Postgres, pooled URL. One migration: `20260923191101_init`. |
| Client setup | `src/config/db.ts`: global singleton, `log` by env, `TX_OPTIONS` (15 s). |
| Imports | `@prisma/client` in 8 `src` files + `prisma/seed.ts`: `PrismaClient`, the `Prisma` namespace (`PrismaClientKnownRequestError`, `TransactionClient`), model types `User`, `Category`, `Collection`, `CollectionItem`. |
| Client features used | Interactive `$transaction` (9 in `src`, 1 in seed), `` $queryRaw`SELECT 1` `` (health). No `$use`, metrics or `$extends`. |
| P2002 handling | `category`, `collection`, `link` controllers check `err.code` only. `profile.controller.ts` `throwIfUniqueViolation` reads `err.meta.target` to tell a `username` clash from a `clerkId` clash. |
| Toolchain | Local Node 20.12.2; TypeScript 5.9.3. |

### Prisma 7 breaking changes that hit this repo
Source: prisma.io "Upgrade to v7" guide.

| Change | Impact here |
|---|---|
| Node ≥ 20.19, TypeScript ≥ 5.4 | Local Node 20.12.2 must be upgraded. TypeScript OK. Vercel: Node 22.x. |
| Generator `prisma-client`; `output` required; client no longer in `node_modules` | New output dir; 9 import sites change; output gitignored and lint-ignored. |
| Driver adapter required | `@prisma/adapter-pg` in `db.ts` and `seed.ts`. `pg` pool defaults differ (no connect timeout; v6 used 5 s). TLS now via `node-pg`. |
| `prisma.config.ts`; CLI no longer loads `.env` | Add the config file; add `dotenv` back (removed in plan 4 Q1 as unused). Verified on 6.19.3: with a config file the CLI prints "skipping environment variable loading". |
| `migrate dev` no longer runs `generate` or the seed | Update the command notes in `CLAUDE.md` §4 and `.claude/skills/prisma-change`. |
| ESM package | The guide sets `"type": "module"`. Change it only if the build requires it (Next bundles the generated client; config files are already `.mjs`/`.ts`). |
| P2002 `meta.target` missing under driver adapters (prisma#28281; fields move to `meta.driverAdapterError.cause.constraint.fields`) | `throwIfUniqueViolation` falls through: a username clash during onboarding would show "already onboarded". Must be fixed (U3). |

### Prisma 8 (not in this plan's build scope)
| Fact | Impact |
|---|---|
| New ORM API (`db.orm.public.<Model>…`), contract file, new migration system | Every query and controller is rewritten. |
| Official path is 7 → 8, side by side, one route at a time | Needs U2 done first. |
| Node ≥ 22.18 | Covered by the Node 22 prerequisite. |

### Risks
| Risk | Mitigation |
|---|---|
| Error, pooling or TLS behaviour changes | Explicit adapter options (U2); U3 helper; U5 regression before `main`. |
| Schema drift | No schema change in this plan. `migrate status` up to date and `migrate diff` empty before and after. |
| Vercel build differs from local | Vercel preview deploy of the branch before merging (U5). |
| Rollback | Revert the merge commit; lockfile restores 6.19.3. No DB change to undo. |

---

## 2. Clarification Questions

Answered 2026-09-25: owner accepted every recommendation.

| Priority | Question | Answer |
|---|---|---|
| High | Target Prisma 7.10 now (after R1), with Prisma 8 as a later plan once it is stable? | Yes. |
| Medium | Driver adapter: `@prisma/adapter-pg` (TCP, the same pooled URL the CLI uses) or `@prisma/adapter-neon` (Neon serverless driver)? | `adapter-pg`: the guide's default for PostgreSQL; one URL for app and CLI. |
| Medium | Generated client at `src/generated/prisma`, gitignored and rebuilt by `postinstall`? | Yes. |
| Low | Upgrade local Node to 22 LTS? | Yes (also meets Prisma 8's floor). Owner action in U1. |

---

## 3. Scope Breakdown

| Epic | Task | Dependencies | Status |
|---|---|---|---|
| U Upgrade | U1 Node 22 + `prisma.config.ts` (on Prisma 6) | Plan 4 R1, §2 answers | Pending |
| U Upgrade | U2 Prisma 7.10 packages, generator, adapter, imports | U1 | Pending |
| U Upgrade | U3 Unique-violation helper | U2 | Pending |
| U Upgrade | U4 Docs and cleanup | U3 | Pending |
| U Upgrade | U5 Regression + Vercel preview | U4 | Pending |
| U Upgrade | U6 Prisma 8 plan | Prisma 8 stable on npm | Deferred |

---

## 4. Execution Plan

### U1 Node 22 + `prisma.config.ts` (still Prisma 6)
- Owner: install Node 22 LTS locally; set the Vercel project to Node 22.x.
- Add `dotenv` next to `prisma` in `dependencies`.
- Add `prisma.config.ts`: `import "dotenv/config"`, `schema`, `migrations.path`, `migrations.seed: "tsx prisma/seed.ts"`. Remove the `package.json#prisma` block. Keep `url` in `schema.prisma` until U2.
- Validation: build prints no Prisma warning; `prisma validate`, `prisma migrate status` (up to date) and `npm run db:seed` pass.

### U2 Prisma 7.10
- `npm install prisma@7.10.0 @prisma/client@7.10.0 @prisma/adapter-pg@7.10.0`; add `pg` only if the adapter does not bring it.
- `schema.prisma`: `provider = "prisma-client"`, `output = "../src/generated/prisma"`; drop `url` from `datasource`. `prisma.config.ts`: `datasource.url = env("DATABASE_URL")`.
- `.gitignore` and `eslint.config.mjs` `globalIgnores`: add `src/generated/**`.
- `db.ts`: `new PrismaClient({ adapter: new PrismaPg({ connectionString, connectionTimeoutMillis: 5_000 }), log })`; keep the singleton and `TX_OPTIONS`.
- Imports: `@prisma/client` → `@/generated/prisma/client` in the 8 `src` files; `seed.ts` uses a relative path and its own adapter.
- `npm audit`: keep the `deepmerge-ts` override while `@prisma/config` pins 7.x; remove it once it doesn't.
- Validation: `prisma generate`; lint/tsc/build; `migrate status` up to date; `prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script` prints no SQL; `/api/health` 200.

### U3 Unique-violation helper
- `src/server/prisma-errors.ts`: `isUniqueViolation(err)` (`P2002` by `code`) and `uniqueViolationFields(err)` (reads `meta.target`, else `meta.driverAdapterError.cause.constraint.fields`; `[]` otherwise). Return field names only, never raw messages.
- Route the four P2002 checks through it (`category`, `collection`, `link`, `profile` controllers).
- Validation: a temporary script (deleted afterwards) forces a duplicate `username` inside a rolled-back transaction and asserts `["username"]`; the onboarding form shows "That username is taken." for a taken name.

### U4 Docs and cleanup
- `CLAUDE.md` §3 stack line and §4 commands (`migrate dev` no longer generates or seeds).
- `.claude/rules/data.md`, `.claude/skills/prisma-change/SKILL.md`: `prisma generate` after `migrate dev`.
- `docs/architecture/overview.md` (config layer: adapter, generated client), `data-model.md` if it names the client; `.env.example` unchanged.

### U5 Regression + Vercel preview
- Local: plan 4 Q2 rows 2–11, Q3 rows 1–7, Q4 rows 1–3 and 6, plus the U3 onboarding case.
- Owner: Vercel preview deploy of the branch → `/api/health` 200, sign in, create a collection, add a link, publish, open the public page signed out.
- Merge: branch → `staging` → owner validation → `main`.

### U6 Prisma 8 plan (deferred)
Write `6_prisma-8.md` when `prisma@8` is stable on npm: contract inference, the `@@map` edits, rewriting queries route by route, migration ownership handoff (`db sign`).

---

## 5. Git Plan

```text
chore/db/prisma-config      # U1
chore/db/prisma-7           # U2–U4
```

Commits: `chore(db): move prisma settings to prisma.config.ts`, `chore(db): upgrade prisma to 7.10 with adapter-pg`, `fix(profile): read unique-violation fields from driver adapter errors`, `docs(architecture): prisma 7 client and commands`.
Merge: branch → `staging` → U5 → `main`.

---

## 6. Testing Plan

- Every task: `npm run lint`, `npx tsc --noEmit`, `npm run build`, `prisma validate`, `prisma migrate status`, `npm run db:seed`.
- U5 list above, run on `staging` data with two accounts.
- Exit criteria: no behaviour change in the U5 list; `npm audit` clean; build free of Prisma warnings; Vercel preview smoke test passes.
