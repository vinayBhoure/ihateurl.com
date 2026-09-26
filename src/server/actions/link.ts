"use server";

import { InvalidUrlError, normalizeUrl } from "@/lib/url/normalize";
import {
  createLinkSchema,
  itemIdSchema,
  linkIdSchema,
  moveLinkSchema,
  reorderItemsSchema,
  updateLinkSchema,
} from "@/lib/validations/link";
import { requireOnboardedUser } from "@/server/auth/current-user";
import * as links from "@/server/controllers/link.controller";
import { RATE_LIMITS, rateLimit } from "@/server/rate-limit";
import { AppError, ok, toActionResult, type ActionResult } from "@/server/result";
import { revalidateCollectionPaths, revalidateCollections } from "@/server/revalidate";

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

    revalidateCollectionPaths(user.username, collection.id, collection.publicId, [collection.slug]);
    return ok({ itemId: item.id, linkId: item.linkId, created });
  } catch (err) {
    return toActionResult(err);
  }
}

/** Any invalid id is reported as NOT_FOUND, so probing ids reveals nothing. */
function parseOrNotFound<T>(result: { success: true; data: T } | { success: false }): T {
  if (!result.success) throw new AppError("NOT_FOUND");
  return result.data;
}

export async function updateLink(input: unknown): Promise<ActionResult<null>> {
  try {
    const user = await requireOnboardedUser();
    const parsed = updateLinkSchema.safeParse(input);
    if (!parsed.success) {
      const { fieldErrors } = parsed.error.flatten();
      if (fieldErrors.id) throw new AppError("NOT_FOUND");
      throw new AppError("VALIDATION", undefined, fieldErrors);
    }

    const collections = await links.updateLink(user.id, parsed.data);

    revalidateCollections(user.username, collections);
    return ok(null);
  } catch (err) {
    return toActionResult(err);
  }
}

export async function deleteLink(input: unknown): Promise<ActionResult<null>> {
  try {
    const user = await requireOnboardedUser();
    const { id } = parseOrNotFound(linkIdSchema.safeParse(input));

    const collections = await links.deleteLink(user.id, id);

    revalidateCollections(user.username, collections);
    return ok(null);
  } catch (err) {
    return toActionResult(err);
  }
}

export async function removeLinkFromCollection(
  input: unknown
): Promise<ActionResult<{ linkDeleted: boolean }>> {
  try {
    const user = await requireOnboardedUser();
    const { itemId } = parseOrNotFound(itemIdSchema.safeParse(input));

    const { collection, linkDeleted } = await links.removeLinkFromCollection(user.id, itemId);

    revalidateCollections(user.username, [collection]);
    return ok({ linkDeleted });
  } catch (err) {
    return toActionResult(err);
  }
}

export async function moveLink(input: unknown): Promise<ActionResult<null>> {
  try {
    const user = await requireOnboardedUser();
    const { itemId, targetCollectionId } = parseOrNotFound(moveLinkSchema.safeParse(input));

    const { source, target } = await links.moveLink(user.id, itemId, targetCollectionId);

    revalidateCollections(user.username, [source, target]);
    return ok(null);
  } catch (err) {
    return toActionResult(err);
  }
}

export async function reorderCollectionItems(input: unknown): Promise<ActionResult<null>> {
  try {
    const user = await requireOnboardedUser();
    const parsed = reorderItemsSchema.safeParse(input);
    if (!parsed.success) {
      const { fieldErrors } = parsed.error.flatten();
      if (fieldErrors.collectionId) throw new AppError("NOT_FOUND");
      throw new AppError("VALIDATION", undefined, fieldErrors);
    }

    const collection = await links.reorderCollectionItems(
      user.id,
      parsed.data.collectionId,
      parsed.data.itemIds
    );

    revalidateCollections(user.username, [collection]);
    return ok(null);
  } catch (err) {
    return toActionResult(err);
  }
}
