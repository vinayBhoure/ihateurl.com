import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { auth, currentUser } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DbCheck } from "@/components/db-check";

export default async function AppHome() {
  // Resource-based auth check — this IS the route protection now (Clerk
  // deprecated gating routes centrally in proxy.ts). Redirects to /login
  // if there's no signed-in user.
  await auth.protect();

  const user = await currentUser();
  const { sessionClaims } = await auth();
  const isAdmin = sessionClaims?.metadata?.role === "admin";

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-neutral-950 p-4 sm:p-8">
      <div className="relative w-full max-w-xl rounded-[2rem] border border-black/5 bg-gradient-to-b from-white to-neutral-50 px-6 py-16 sm:px-12">
        <div className="absolute right-6 top-6">
          <UserButton />
        </div>

        <div className="relative flex flex-col items-center gap-6 text-center">
          <Badge
            variant="outline"
            className="gap-1.5 rounded-full border-neutral-200 bg-white px-3 py-1 text-neutral-600 shadow-sm"
          >
            <ShieldCheck className="size-3.5 text-emerald-500" />
            Signed in
          </Badge>

          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            Welcome, {user?.firstName ?? "there"} 👋
          </h1>
          <p className="max-w-sm text-neutral-500">
            This is <code className="rounded bg-neutral-100 px-1.5 py-0.5">/app</code> — a
            protected route. Only signed-in users reach this page.
          </p>

          <Card className="w-full max-w-md border-neutral-200 bg-white/80 shadow-lg shadow-black/[0.03] backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Database Connection</CardTitle>
              <CardDescription>
                Writes and reads back an example record using your DATABASE_URL.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DbCheck />
            </CardContent>
          </Card>

          {isAdmin && (
            <Link
              href="/app/admin"
              className="text-sm font-medium text-violet-600 underline underline-offset-2 hover:text-violet-700"
            >
              Go to Admin area →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
