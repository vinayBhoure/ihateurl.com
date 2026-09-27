"use server";

import { revalidatePath } from "next/cache";
import { savedCollectionSchema } from "@/lib/validations/saved";
import { requireOnboardedUser } from "@/server/auth/current-user";
import * as saved from "@/server/controllers/saved.controller";
import { RATE_LIMITS, rateLimit } from "@/server/rate-limit";
import { AppError, ok, toActionResult, type ActionResult } from "@/server/result";

/** Plan 9 §2.3. Save and unsave share one rate limit, so toggling can't be spammed. */
function limitSaves(userId: string) {
  const { limit, windowMs } = RATE_LIMITS.saveCollection;
  rateLimit(`saveCollection:${userId}`, limit, windowMs);
}

export async function saveCollection(input: unknown): Promise<ActionResult<null>> {
  try {
    const user = await requireOnboardedUser();
    limitSaves(user.id);

    const parsed = savedCollectionSchema.safeParse(input);
    if (!parsed.success) throw new AppError("NOT_FOUND");

    await saved.saveCollection(user.id, parsed.data.collectionId);

    revalidatePath("/app/saved");
    return ok(null);
  } catch (err) {
    return toActionResult(err);
  }
}

export async function unsaveCollection(input: unknown): Promise<ActionResult<null>> {
  try {
    const user = await requireOnboardedUser();
    limitSaves(user.id);

    const parsed = savedCollectionSchema.safeParse(input);
    if (!parsed.success) throw new AppError("NOT_FOUND");

    await saved.unsaveCollection(user.id, parsed.data.collectionId);

    revalidatePath("/app/saved");
    return ok(null);
  } catch (err) {
    return toActionResult(err);
  }
}
