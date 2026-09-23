---
name: server-action
description: Adding or changing a mutation. Use when writing or editing a server action.
---

# server-action

Use when adding or changing a mutation. Follow `docs/architecture/server-actions.md` for the contract, error codes and revalidated paths.

## Steps
1. **Schema** — add or update the Zod schema in `src/lib/validations/`.
2. **Controller** — implement the mutation in `src/server/controllers/`. Load records with `where: { id, userId }`; never trust a user ID from the client.
3. **Action** — wire the server action: resolve user → Zod validate → controller → `revalidatePath` → return `ActionResult<T>`.
4. **Revalidate** — call `revalidatePath` for every path the mutation affects.
5. **Manual check** — exercise the action in the running app (dev server); confirm the UI updates and errors surface as toasts.

## Checklist
- [ ] Zod schema shared by the form and the action
- [ ] Ownership enforced via `where: { id, userId }`; not-found and not-owned both return `NOT_FOUND`
- [ ] Multi-row writes wrapped in `prisma.$transaction`
- [ ] `revalidatePath` called for affected routes
- [ ] Manually exercised in the app
