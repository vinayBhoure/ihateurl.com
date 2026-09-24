import Link from "next/link";
import { Wordmark } from "@/components/wordmark";

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-8 text-sm text-muted-foreground md:px-6">
        <Wordmark href="/" className="text-foreground" />
        <nav aria-label="Footer">
          <Link href="/explore" className="inline-flex min-h-11 items-center hover:text-foreground md:min-h-0">
            Explore
          </Link>
        </nav>
        <p className="ml-auto">© {new Date().getFullYear()} ihateurl</p>
      </div>
    </footer>
  );
}
