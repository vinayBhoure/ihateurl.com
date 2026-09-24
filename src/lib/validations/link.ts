import { z } from "zod";
import { categoryIdsSchema } from "@/lib/validations/category";

const id = z.string().min(1);

export const createLinkSchema = z.object({
  collectionId: id,
  url: z.string().trim().min(1, "Enter a URL.").max(2048, "That URL is too long."),
});

/** Omitted field = unchanged; empty `description` = cleared; `categoryIds` replaces the set. */
export const updateLinkSchema = z.object({
  id,
  title: z
    .string()
    .trim()
    .min(1, "Enter a title.")
    .max(300, "Titles must be 300 characters or fewer.")
    .optional(),
  description: z
    .string()
    .trim()
    .max(1000, "Descriptions must be 1000 characters or fewer.")
    .optional()
    .transform((value) => (value === undefined ? undefined : value || null)),
  categoryIds: categoryIdsSchema.optional(),
});

export const linkIdSchema = z.object({ id });

export const itemIdSchema = z.object({ itemId: id });

export const moveLinkSchema = z.object({ itemId: id, targetCollectionId: id });

export const reorderItemsSchema = z.object({
  collectionId: id,
  itemIds: z.array(id).max(1000),
});

export type UpdateLinkInput = z.infer<typeof updateLinkSchema>;
