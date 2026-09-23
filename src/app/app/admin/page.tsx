import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { Badge } from "@/components/ui/badge";

/**
 * Example role-gated page. Resource-based auth: this page checks its own
 * authorization rather than relying on proxy.ts (Clerk deprecated
 * middleware-based route gating — see src/proxy.ts).
 *
 * Requires a `role: "admin"` entry in a user's Clerk publicMetadata.
 * See README.md -> "Adding role-based access" for the full setup.
 */
export default async function AdminPage() {
  // Base sign-in requirement (redirects to /login if signed out).
  await auth.protect();

  const { sessionClaims } = await auth();

  // Role check — the actual gate for this page.
  if (sessionClaims?.metadata?.role !== "admin") {
    redirect("/app");
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-neutral-950 p-4 sm:p-8">
      <div className="relative w-full max-w-xl rounded-[2rem] border border-black/5 bg-gradient-to-b from-white to-neutral-50 px-6 py-16 sm:px-12">
        <div className="relative flex flex-col items-center gap-6 text-center">
          <Badge
            variant="outline"
            className="gap-1.5 rounded-full border-violet-200 bg-violet-50 px-3 py-1 text-violet-700 shadow-sm"
          >
            Admin only
          </Badge>

          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Admin area</h1>
          <p className="max-w-sm text-neutral-500">
            You&rsquo;re seeing this because your Clerk user has{" "}
            <code className="rounded bg-neutral-100 px-1.5 py-0.5">publicMetadata.role</code> set
            to <code className="rounded bg-neutral-100 px-1.5 py-0.5">&quot;admin&quot;</code>.
            Anyone else hitting this URL is redirected back to{" "}
            <code className="rounded bg-neutral-100 px-1.5 py-0.5">/app</code>.
          </p>

          <Link
            href="/app"
            className="text-sm font-medium text-violet-600 underline underline-offset-2 hover:text-violet-700"
          >
            ← Back to /app
          </Link>
        </div>
      </div>
    </div>
  );
}
