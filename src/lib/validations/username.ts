import { z } from "zod";
import { RESERVED_USERNAMES } from "@/lib/reserved-usernames";

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9_-]{3,30}$/, "Use 3–30 letters, numbers, - or _.")
  .refine((value) => !RESERVED_USERNAMES.has(value), "This username is reserved.");
