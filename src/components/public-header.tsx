import Link from "next/link";
import { Show } from "@clerk/nextjs";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/user-menu";
import { Wordmark } from "@/components/wordmark";
import { getCurrentUser } from "@/server/auth/current-user";

export async function PublicHeader() {
  const user = await getCurrentUser();

  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-2 px-4 md:gap-4 md:px-6">
        <Wordmark href="/" />
        <nav aria-label="Main">
          <Button asChild variant="ghost" size="sm">
            <Link href="/explore">Explore</Link>
          </Button>
        </nav>
        <div className="ml-auto flex items-center gap-1 md:gap-2">
          <ThemeToggle />
          <Show when="signed-out">
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/signup">Sign up</Link>
            </Button>
          </Show>
          <Show when="signed-in">
            <Button asChild variant="ghost" size="sm">
              <Link href="/app">Go to app</Link>
            </Button>
            <UserMenu username={user?.username} />
          </Show>
        </div>
      </div>
    </header>
  );
}
