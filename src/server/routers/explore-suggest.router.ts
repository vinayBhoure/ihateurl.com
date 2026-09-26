import { NextResponse, type NextRequest } from "next/server";
import { suggestPublic } from "@/server/queries/public";
import { RATE_LIMITS, rateLimit } from "@/server/rate-limit";
import { AppError } from "@/server/result";

/** Vercel sets this at the edge; falls back to a shared bucket when absent (local dev). */
function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

export async function handleExploreSuggest(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? "";

  try {
    const { limit, windowMs } = RATE_LIMITS.exploreSuggest;
    rateLimit(`exploreSuggest:${clientIp(request)}`, limit, windowMs);
  } catch (err) {
    if (err instanceof AppError && err.code === "RATE_LIMITED") {
      return NextResponse.json({ results: [] }, { status: 429 });
    }
    throw err;
  }

  const results = await suggestPublic(q);
  return NextResponse.json({ results });
}
