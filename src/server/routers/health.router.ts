import { NextResponse } from "next/server";
import { pingInputSchema } from "@/lib/validations/ping";
import { validateBody } from "@/server/middleware/validate";
import { checkDatabaseConnection } from "@/server/controllers/health.controller";

/**
 * Thin router layer: validate -> call controller -> shape response.
 * Kept separate from the Next.js route file so the same logic could be
 * reused from a different transport (e.g. a CLI or a queue worker) later.
 */
export async function handleHealthCheck(request: Request) {
  const validation = await validateBody(request, pingInputSchema);
  if (!validation.success) return validation.response;

  const result = await checkDatabaseConnection(validation.data);
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}
