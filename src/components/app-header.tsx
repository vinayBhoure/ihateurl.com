import { UserButton } from "@clerk/nextjs";
import { AppMobileMenu } from "@/components/app-mobile-menu";
import { AppNav } from "@/components/app-nav";
import { AppSearchForm } from "@/components/app-search-form";
import { ThemeToggle } from "@/components/theme-toggle";
import { Wordmark } from "@/components/wordmark";

/** FP2 top bar. Nav and search collapse into `AppMobileMenu` below 768 px. */
export function AppHeader() {
  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 w-full max-w-3xl items-center gap-2 px-4 md:gap-4 md:px-6">
        <Wordmark href="/app" />
        <div className="hidden md:block">
          <AppNav />
        </div>
        <div className="ml-auto flex items-center gap-1 md:gap-2">
          <AppSearchForm className="hidden w-48 md:block" />
          <ThemeToggle />
          <UserButton />
          <AppMobileMenu />
        </div>
      </div>
    </header>
  );
}
