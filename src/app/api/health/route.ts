import { handleHealthCheck } from "@/server/routers/health.router";

export const dynamic = "force-dynamic";

export async function GET() {
  return handleHealthCheck();
}
