import { z } from "zod";
import { SLUG_PATTERN } from "@/lib/slug";
import { categoryIdsSchema } from "@/lib/validations/category";

const title = z
  .string()
  .trim()
  .min(1, "Enter a title.")
  .max(100, "Titles must be 100 characters or fewer.");

const description = z
  .string()
  .trim()
  .max(500, "Descriptions must be 500 characters or fewer.");

export const createCollectionSchema = z.object({
  title,
  description: description.optional().transform((value) => value || undefined),
});

/** Omitted field = unchanged; empty `description` = cleared. Renaming never changes the slug. */
export const updateCollectionSchema = z.object({
  id: z.string().min(1),
  title: title.optional(),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(SLUG_PATTERN, "Use 1–60 lowercase letters, numbers or -.")
    .optional(),
  description: description
    .optional()
    .transform((value) => (value === undefined ? undefined : value || null)),
  visibility: z.enum(["PRIVATE", "PUBLIC"]).optional(),
  categoryIds: categoryIdsSchema.optional(),
});

export const collectionIdSchema = z.object({
  id: z.string().min(1),
});

export type UpdateCollectionInput = z.infer<typeof updateCollectionSchema>;
