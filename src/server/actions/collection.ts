"use server";

import { revalidatePath } from "next/cache";
import {
  collectionIdSchema,
  copyCollectionSchema,
  createCollectionSchema,
  updateCollectionSchema,
} from "@/lib/validations/collection";
import { requireOnboardedUser } from "@/server/auth/current-user";
import * as collections from "@/server/controllers/collection.controller";
import * as copies from "@/server/controllers/copy.controller";
import { RATE_LIMITS, rateLimit } from "@/server/rate-limit";
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

/** P4. Returns the new collection id; the UI navigates to it. */
export async function copyCollection(input: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireOnboardedUser();
    const { limit, windowMs } = RATE_LIMITS.copyCollection;
    rateLimit(`copyCollection:${user.id}`, limit, windowMs);

    const parsed = copyCollectionSchema.safeParse(input);
    if (!parsed.success) throw new AppError("NOT_FOUND");

    const copy = await copies.copyCollection(user.id, parsed.data.sourceCollectionId);

    revalidatePath("/app");
    return ok({ id: copy.id });
  } catch (err) {
    return toActionResult(err);
  }
}
