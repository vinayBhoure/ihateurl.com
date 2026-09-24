import { z } from "zod";
import { usernameSchema } from "@/lib/validations/username";

/** Omitted field = unchanged; empty `displayName` / `bio` = cleared. */
export const updateProfileSchema = z.object({
  username: usernameSchema.optional(),
  displayName: z
    .string()
    .trim()
    .max(60, "Display name must be 60 characters or fewer.")
    .optional()
    .transform((value) => (value === undefined ? undefined : value || null)),
  bio: z
    .string()
    .trim()
    .max(280, "Bio must be 280 characters or fewer.")
    .optional()
    .transform((value) => (value === undefined ? undefined : value || null)),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
