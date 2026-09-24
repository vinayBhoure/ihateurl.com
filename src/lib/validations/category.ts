import { z } from "zod";

export const MAX_CATEGORIES_PER_ITEM = 5;

export const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter a category name.")
    .max(30, "Category names must be 30 characters or fewer."),
});

export const deleteCategorySchema = z.object({
  id: z.string().min(1),
});

/** I6: shared by collection and link actions. */
export const categoryIdsSchema = z
  .array(z.string().min(1))
  .max(MAX_CATEGORIES_PER_ITEM, `Pick up to ${MAX_CATEGORIES_PER_ITEM} categories.`)
  .transform((ids) => [...new Set(ids)]);
