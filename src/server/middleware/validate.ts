import { NextResponse } from "next/server";
import type { z, ZodTypeAny } from "zod";

type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; response: NextResponse };

/**
 * Parses and validates a request body against a Zod schema.
 * Use at the top of a route handler: `const v = await validateBody(req, schema)`.
 *
 * Generic is bound to the schema itself (not ZodSchema<T>) so schemas using
 * `.default()` — where the parsed output type differs from the raw input type —
 * still infer the correct (output) type for `data`.
 */
export async function validateBody<S extends ZodTypeAny>(
  request: Request,
  schema: S
): Promise<ValidationResult<z.infer<S>>> {
  let json: unknown = {};
  try {
    json = await request.json();
  } catch {
    json = {};
  }

  const result = schema.safeParse(json);

  if (!result.success) {
    return {
      success: false,
      response: NextResponse.json(
        { ok: false, error: "Validation failed", issues: result.error.flatten() },
        { status: 400 }
      ),
    };
  }

  return { success: true, data: result.data };
}
