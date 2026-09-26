import { prisma } from "@/config/db";
import type { SocialLinksInput } from "@/lib/validations/social";

/** Plan 7 §2.3: replaces the user's whole set in one transaction; `position` = input order. */
export async function replaceSocialLinks(
  userId: string,
  links: SocialLinksInput["links"]
): Promise<void> {
  await prisma.$transaction([
    prisma.socialLink.deleteMany({ where: { userId } }),
    prisma.socialLink.createMany({
      data: links.map((link, position) => ({ userId, ...link, position })),
    }),
  ]);
}
