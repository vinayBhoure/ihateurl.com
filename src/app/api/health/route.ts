import { handleHealthCheck } from "@/server/routers/health.router";

export async function POST(request: Request) {
  return handleHealthCheck(request);
}
