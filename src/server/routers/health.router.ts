import { NextResponse } from "next/server";
import { checkDatabaseConnection } from "@/server/controllers/health.controller";

export async function handleHealthCheck() {
  const result = await checkDatabaseConnection();
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}
