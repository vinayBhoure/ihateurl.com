import { z } from "zod";
import { usernameSchema } from "@/lib/validations/username";

export const onboardingSchema = z.object({
  username: usernameSchema,
  displayName: z
    .string()
    .trim()
    .max(60, "Display name must be 60 characters or fewer.")
    .optional()
    .transform((value) => value || undefined),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
