import { z } from "zod";

export const createLinkSchema = z.object({
  collectionId: z.string().min(1),
  url: z.string().trim().min(1, "Enter a URL.").max(2048, "That URL is too long."),
});
