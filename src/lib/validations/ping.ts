import { z } from "zod";

/**
 * Example Zod schema — validates the body sent to /api/health.
 * Add your own schemas alongside this one as you build real endpoints.
 */
export const pingInputSchema = z.object({
  message: z
    .string()
    .min(1, "Message is required")
    .max(200, "Message must be under 200 characters")
    .default("pong"),
});

export type PingInput = z.infer<typeof pingInputSchema>;
