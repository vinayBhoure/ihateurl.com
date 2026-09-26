"use server";

import { revalidatePath } from "next/cache";
import { createCategorySchema, deleteCategorySchema } from "@/lib/validations/category";
import { requireOnboardedUser } from "@/server/auth/current-user";
import * as categories from "@/server/controllers/category.controller";
import { AppError, ok, toActionResult, type ActionResult } from "@/server/result";

export async function createCategory(
  input: unknown
): Promise<ActionResult<{ id: string; name: string; slug: string }>> {
  try {
    const user = await requireOnboardedUser();
    const parsed = createCategorySchema.safeParse(input);
    if (!parsed.success) {
      throw new AppError("VALIDATION", undefined, parsed.error.flatten().fieldErrors);
    }

    const category = await categories.createCategory(user.id, parsed.data.name);

    revalidatePath("/app/settings");
    revalidatePath("/app/collections/[id]", "page");
    return ok({ id: category.id, name: category.name, slug: category.slug });
  } catch (err) {
    return toActionResult(err);
  }
}

export async function deleteCategory(input: unknown): Promise<ActionResult<null>> {
  try {
    const user = await requireOnboardedUser();
    const parsed = deleteCategorySchema.safeParse(input);
    if (!parsed.success) throw new AppError("NOT_FOUND");

    await categories.deleteCategory(user.id, parsed.data.id);

    revalidatePath("/app/settings");
    revalidatePath("/app");
    revalidatePath(`/u/${user.username}`);
    return ok(null);
  } catch (err) {
    return toActionResult(err);
  }
}
