# Validation

- One Zod schema per input, defined in `src/lib/validations/`.
- Forms and server actions share the same schema — do not duplicate.
- Server actions return `ActionResult<T>`.
