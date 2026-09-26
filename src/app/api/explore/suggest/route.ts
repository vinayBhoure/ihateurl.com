import type { NextRequest } from "next/server";
import { handleExploreSuggest } from "@/server/routers/explore-suggest.router";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return handleExploreSuggest(request);
}
