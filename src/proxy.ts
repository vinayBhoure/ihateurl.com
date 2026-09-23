import { clerkMiddleware } from "@clerk/nextjs/server";

// Next.js 16 renamed the `middleware.ts` file convention to `proxy.ts` —
// this file plays the same role (runs before every matched request).
// See: https://nextjs.org/docs/messages/middleware-to-proxy
//
// Clerk deprecated route-matching-based auth checks here (createRouteMatcher)
// in favor of "resource-based" checks: each protected page/route/action calls
// `await auth.protect()` itself, since path-based middleware gating can be
// bypassed (Server Actions are called by ID, not by path; regex-to-route
// mapping can have gaps). See src/app/app/page.tsx and
// src/app/app/admin/page.tsx for where the actual protection now lives.
export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
