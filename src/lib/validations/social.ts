import { z } from "zod";
import {
  EXTRA_LINKS_MAX,
  SOCIAL_LINKS_MAX,
  SOCIAL_PLATFORM_CONFIG,
  SOCIAL_PLATFORMS,
  isHandlePlatform,
  normalizeSocialValue,
  socialValueError,
  type SocialPlatform,
} from "@/lib/social-platforms";

/** Field-error key for `links[index]`: flat, so `flatten().fieldErrors` keeps it per row. */
export function socialFieldKey(index: number): string {
  return `links.${index}`;
}

function limitError(platform: SocialPlatform, count: number, extras: number): string | null {
  const { label, max } = SOCIAL_PLATFORM_CONFIG[platform];
  if (count > max) return max === 1 ? `Add only one ${label} link.` : `Add up to ${max} ${label} links.`;
  if (!isHandlePlatform(platform) && extras > EXTRA_LINKS_MAX) {
    return `Add up to ${EXTRA_LINKS_MAX} extra links.`;
  }
  return null;
}

/**
 * The full set of a user's social links, in display order (replaces the saved set).
 * Values are normalized (`@`/pasted URL stripped); empty ones are dropped. One link per
 * handle platform, one Website, and at most 3 Website + Other links in total.
 */
export const socialLinksSchema = z
  .object({
    links: z
      .array(
        z.object({
          platform: z.enum(SOCIAL_PLATFORMS),
          value: z.string().max(2048, "That link is too long."),
        })
      )
      .max(SOCIAL_LINKS_MAX, "Too many links."),
  })
  .transform(({ links }, ctx) => {
    const cleaned: { platform: SocialPlatform; value: string }[] = [];
    const counts = new Map<SocialPlatform, number>();
    let extras = 0;

    links.forEach((link, index) => {
      const value = normalizeSocialValue(link.platform, link.value);
      if (value === "") return;

      const count = (counts.get(link.platform) ?? 0) + 1;
      counts.set(link.platform, count);
      if (!isHandlePlatform(link.platform)) extras += 1;

      const message =
        socialValueError(link.platform, value) ?? limitError(link.platform, count, extras);
      if (message) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: [socialFieldKey(index)], message });
        return;
      }
      cleaned.push({ platform: link.platform, value });
    });

    return { links: cleaned };
  });

export type SocialLinksInput = z.infer<typeof socialLinksSchema>;
