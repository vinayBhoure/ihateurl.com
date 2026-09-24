"use server";

import { revalidatePath } from "next/cache";
import {
  collectionIdSchema,
  createCollectionSchema,
  updateCollectionSchema,
} from "@/lib/validations/collection";
import { requireOnboardedUser } from "@/server/auth/current-user";
import * as collections from "@/server/controllers/collection.controller";
import { AppError, ok, toActionResult, type ActionResult } from "@/server/result";
import { revalidateCollectionPaths } from "@/server/revalidate";

export async function createCollection(
  input: unknown
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    const user = await requireOnboardedUser();
    const parsed = createCollectionSchema.safeParse(input);
    if (!parsed.success) {
      throw new AppError("VALIDATION", undefined, parsed.error.flatten().fieldErrors);
    }

    const collection = await collections.createCollection(user.id, parsed.data);

    revalidatePath("/app");
    return ok({ id: collection.id, slug: collection.slug });
  } catch (err) {
    return toActionResult(err);
  }
}

export async function updateCollection(
  input: unknown
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    const user = await requireOnboardedUser();
    const parsed = updateCollectionSchema.safeParse(input);
    if (!parsed.success) {
      const { fieldErrors } = parsed.error.flatten();
      if (fieldErrors.id) throw new AppError("NOT_FOUND");
      throw new AppError("VALIDATION", undefined, fieldErrors);
    }

    const { before, after } = await collections.updateCollection(user.id, parsed.data);

    revalidateCollectionPaths(user.username, after.id, [before.slug, after.slug]);
    return ok({ id: after.id, slug: after.slug });
  } catch (err) {
    return toActionResult(err);
  }
}

export async function deleteCollection(input: unknown): Promise<ActionResult<null>> {
  try {
    const user = await requireOnboardedUser();
    const parsed = collectionIdSchema.safeParse(input);
    if (!parsed.success) throw new AppError("NOT_FOUND");

    const deleted = await collections.deleteCollection(user.id, parsed.data.id);

    revalidateCollectionPaths(user.username, deleted.id, [deleted.slug]);
    return ok(null);
  } catch (err) {
    return toActionResult(err);
  }
}
