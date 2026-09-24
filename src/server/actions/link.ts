"use server";

import { InvalidUrlError, normalizeUrl } from "@/lib/url/normalize";
import { createLinkSchema } from "@/lib/validations/link";
import { requireOnboardedUser } from "@/server/auth/current-user";
import * as links from "@/server/controllers/link.controller";
import { RATE_LIMITS, rateLimit } from "@/server/rate-limit";
import { AppError, ok, toActionResult, type ActionResult } from "@/server/result";
import { revalidateCollectionPaths } from "@/server/revalidate";

export async function createLink(
  input: unknown
): Promise<ActionResult<{ itemId: string; linkId: string; created: boolean }>> {
  try {
    const user = await requireOnboardedUser();
    const { limit, windowMs } = RATE_LIMITS.createLink;
    rateLimit(`createLink:${user.id}`, limit, windowMs);

    const parsed = createLinkSchema.safeParse(input);
    if (!parsed.success) {
      const { fieldErrors } = parsed.error.flatten();
      if (fieldErrors.collectionId) throw new AppError("NOT_FOUND");
      throw new AppError("VALIDATION", undefined, fieldErrors);
    }

    let url: string;
    let normalizedUrl: string;
    try {
      normalizedUrl = normalizeUrl(parsed.data.url);
      url = new URL(parsed.data.url).toString();
    } catch (err) {
      const message = err instanceof InvalidUrlError ? err.message : "Enter a valid URL.";
      throw new AppError("VALIDATION", message, { url: [message] });
    }

    const { item, created, collection } = await links.createLink(
      user.id,
      parsed.data.collectionId,
      url,
      normalizedUrl
    );

    revalidateCollectionPaths(user.username, collection.id, [collection.slug]);
    return ok({ itemId: item.id, linkId: item.linkId, created });
  } catch (err) {
    return toActionResult(err);
  }
}
