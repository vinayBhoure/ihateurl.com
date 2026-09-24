export const SLUG_MAX_LENGTH = 60;
export const SLUG_PATTERN = /^[a-z0-9-]{1,60}$/;
/** P2: lowercase ASCII, words joined by `-`, max 60 chars. */
export function slugify(title: string, fallback = "collection"): string {
  const slug = title
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SLUG_MAX_LENGTH)
    .replace(/-+$/, "");
  return slug || fallback;
}
