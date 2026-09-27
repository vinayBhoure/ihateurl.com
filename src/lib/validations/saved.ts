import { z } from "zod";

/** Plan 9: save and unsave take the saved collection's id. */
export const savedCollectionSchema = z.object({
  collectionId: z.string().cuid(),
});
