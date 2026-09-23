---
name: prisma-change
description: Changing schema.prisma. Use when adding, editing or removing a model, field or index.
---

# prisma-change

Use when changing `prisma/schema.prisma`. Follow `docs/architecture/data-model.md` for invariants I1–I9, delete behaviour and indexes before editing.

## Steps
1. **Edit** — change `prisma/schema.prisma`. PostgreSQL only, no MongoDB fields.
2. **Migrate** — run `prisma migrate dev --name <change>`. Never edit an already-applied migration.
3. **Update docs** — update `docs/architecture/data-model.md` if the change affects invariants, delete behaviour or indexes.
4. **Seed** — update the seed script if the new/changed model needs seed data.

## Checklist
- [ ] Migration created via `prisma migrate dev --name <change>`, not hand-edited
- [ ] No raw SQL added outside the health check
- [ ] `docs/architecture/data-model.md` updated if invariants or indexes changed
- [ ] Seed script updated if required
- [ ] `npx tsc --noEmit` passes after regenerating the Prisma client
