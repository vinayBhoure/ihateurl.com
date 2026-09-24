import { Prisma, type Category } from "@prisma/client";
import { prisma } from "@/config/db";
import { slugify } from "@/lib/slug";
import { AppError } from "@/server/result";

const NAME_TAKEN = "A category with that name already exists.";

/** I7: custom names can't match a system name or the user's other names (case-insensitive). */
export async function createCategory(userId: string, name: string): Promise<Category> {
  const clash = await prisma.category.findFirst({
    where: {
      name: { equals: name, mode: "insensitive" },
      OR: [{ userId: null }, { userId }],
    },
    select: { id: true },
  });
  if (clash) throw new AppError("CONFLICT", NAME_TAKEN, { name: [NAME_TAKEN] });

  try {
    return await prisma.category.create({
      data: { userId, name, slug: slugify(name, "category") },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      const message = "A category with a very similar name already exists.";
      throw new AppError("CONFLICT", message, { name: [message] });
    }
    throw err;
  }
}

/** Own categories only; system rows (userId null) never match (I9). Joins cascade. */
export async function deleteCategory(userId: string, id: string): Promise<void> {
  const { count } = await prisma.category.deleteMany({ where: { id, userId } });
  if (count === 0) throw new AppError("NOT_FOUND");
}

/** I6: every id must be a system category or one of the user's own. Pass deduped ids (max 5). */
export async function assertAttachableCategories(userId: string, ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const found = await prisma.category.count({
    where: { id: { in: ids }, OR: [{ userId: null }, { userId }] },
  });
  if (found !== ids.length) throw new AppError("NOT_FOUND", "One or more categories were not found.");
}
