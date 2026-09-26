import { prisma } from "@/config/db";

/** Settings form: the user's own links as stored (handle or URL), in display order. */
export async function listMySocialLinks(userId: string) {
  return prisma.socialLink.findMany({
    where: { userId },
    select: { platform: true, value: true },
    orderBy: { position: "asc" },
  });
}
