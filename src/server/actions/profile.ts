"use server";

import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { onboardingSchema } from "@/lib/validations/onboarding";
import { updateProfileSchema } from "@/lib/validations/profile";
import { usernameSchema } from "@/lib/validations/username";
import { requireOnboardedUser, requireUser } from "@/server/auth/current-user";
import {
  createUserProfile,
  isUsernameTaken,
  updateUserProfile,
} from "@/server/controllers/profile.controller";
import { AppError, ok, toActionResult, type ActionResult } from "@/server/result";

export async function checkUsername(
  username: unknown
): Promise<ActionResult<{ available: boolean; reason?: string }>> {
  try {
    await requireUser();
    if (typeof username !== "string") throw new AppError("VALIDATION");

    const parsed = usernameSchema.safeParse(username);
    if (!parsed.success) {
      return ok({ available: false, reason: parsed.error.issues[0].message });
    }
    if (await isUsernameTaken(parsed.data)) {
      return ok({ available: false, reason: "That username is taken." });
    }
    return ok({ available: true });
  } catch (err) {
    return toActionResult(err);
  }
}

export async function completeOnboarding(
  input: unknown
): Promise<ActionResult<{ username: string }>> {
  try {
    const clerkId = await requireUser();

    const parsed = onboardingSchema.safeParse(input);
    if (!parsed.success) {
      throw new AppError("VALIDATION", undefined, parsed.error.flatten().fieldErrors);
    }

    const clerkUser = await currentUser();
    const clerkName =
      clerkUser?.fullName?.trim() || clerkUser?.firstName?.trim() || undefined;

    const user = await createUserProfile({
      clerkId,
      username: parsed.data.username,
      displayName: parsed.data.displayName ?? clerkName,
      avatarUrl: clerkUser?.imageUrl || undefined,
    });

    revalidatePath("/app");
    return ok({ username: user.username });
  } catch (err) {
    return toActionResult(err);
  }
}

export async function updateProfile(input: unknown): Promise<ActionResult<{ username: string }>> {
  try {
    const user = await requireOnboardedUser();

    const parsed = updateProfileSchema.safeParse(input);
    if (!parsed.success) {
      throw new AppError("VALIDATION", undefined, parsed.error.flatten().fieldErrors);
    }

    const updated = await updateUserProfile(user.id, parsed.data);

    revalidatePath("/app/settings");
    revalidatePath(`/${user.username}`);
    if (updated.username !== user.username) revalidatePath(`/${updated.username}`);
    return ok({ username: updated.username });
  } catch (err) {
    return toActionResult(err);
  }
}
