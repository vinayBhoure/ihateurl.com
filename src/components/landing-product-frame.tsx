import type { ReactNode } from "react";
import type { VariantProps } from "class-variance-authority";
import { ArrowDown, ArrowUp, BookmarkPlus, Copy, MoreHorizontal, Pencil, Share2 } from "lucide-react";
import { LetterTile } from "@/components/letter-tile";
import { LinkRow, type LinkRowData } from "@/components/link-row";
import { VisibilityBadge } from "@/components/visibility-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Static sample data: nothing is fetched and no favicons are hotlinked (letter tiles, LD3).
const SAMPLE_LINKS: LinkRowData[] = [
  { url: "https://web.dev/learn/css", title: "Learn CSS", domain: "web.dev", faviconUrl: null, categories: [{ id: "1", name: "Learning" }] },
  { url: "https://www.refactoringui.com", title: "Refactoring UI", domain: "refactoringui.com", faviconUrl: null, categories: [{ id: "2", name: "Design" }] },
  { url: "https://developer.mozilla.org", title: "MDN Web Docs", domain: "developer.mozilla.org", faviconUrl: null, categories: [{ id: "3", name: "Technology" }] },
  { url: "https://news.ycombinator.com", title: "Hacker News", domain: "news.ycombinator.com", faviconUrl: null, categories: [{ id: "4", name: "News" }] },
];

/**
 * Landing preview (plan 3 §4.2 #3): a private collection in the app and the same collection's
 * public page. Decorative and `inert`: not focusable, not announced; the hero copy says what it shows.
 * Below 768 px only the public page is shown.
 */
export function ProductFrame() {
  return (
    <div inert className="grid gap-6 md:grid-cols-2 md:items-start">
      <Panel url="ihateurl.com/app/collections/…" visibility="PRIVATE" className="hidden md:block">
        <PrivateCollection />
      </Panel>
      <Panel url="ihateurl.com/you/reading-list" visibility="PUBLIC" className="md:mt-12">
        <PublicCollection />
      </Panel>
    </div>
  );
}

function Panel({
  url,
  visibility,
  className,
  children,
}: {
  url: string;
  visibility: "PRIVATE" | "PUBLIC";
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("overflow-hidden rounded-lg border bg-background", className)}>
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <span className="truncate font-mono text-sm">{url}</span>
        <VisibilityBadge visibility={visibility} />
      </div>
      <div className="space-y-4 p-4">{children}</div>
    </div>
  );
}

function PrivateCollection() {
  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-xl font-semibold tracking-[-0.015em]">Reading list</p>
        <div className="flex shrink-0 items-center gap-1">
          <StaticButton variant="outline" size="sm">
            <Pencil />
            Edit
          </StaticButton>
          <StaticButton variant="ghost" size="icon">
            <MoreHorizontal />
          </StaticButton>
        </div>
      </div>
      <CategoryBadges />
      <div className="flex gap-2">
        <Input readOnly defaultValue="https://refactoringui.com" />
        <StaticButton className="shrink-0">Add</StaticButton>
      </div>
      <LinkList links={SAMPLE_LINKS.slice(0, 3)} actions={<RowActions />} />
    </>
  );
}

function PublicCollection() {
  return (
    <>
      <div className="space-y-2">
        <p className="text-xl font-semibold tracking-[-0.015em]">Reading list</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2 text-foreground">
            <Avatar size="sm">
              <AvatarFallback className="text-xs">Y</AvatarFallback>
            </Avatar>
            you
          </span>
          <span>4 links · Updated today</span>
        </div>
      </div>
      <CategoryBadges />
      <div className="flex flex-wrap items-center gap-2">
        <StaticButton>
          <BookmarkPlus />
          Save to my collections
        </StaticButton>
        <StaticButton variant="outline" size="icon">
          <Copy />
        </StaticButton>
        {/* Hidden below 768 px so the row fits on one line at 360 px. */}
        <StaticButton variant="outline" size="icon" className="hidden md:inline-flex">
          <Share2 />
        </StaticButton>
      </div>
      <LinkList links={SAMPLE_LINKS} />
    </>
  );
}

function CategoryBadges() {
  return (
    <div className="flex flex-wrap gap-2">
      {["Design", "Learning"].map((name) => (
        <Badge key={name} variant="secondary" className="font-medium">
          {name}
        </Badge>
      ))}
    </div>
  );
}

function LinkList({ links, actions }: { links: LinkRowData[]; actions?: ReactNode }) {
  return (
    <ul className="divide-y rounded-lg border">
      {links.map((link) => (
        <li key={link.url}>
          <LinkRow
            link={link}
            icon={<LetterTile text={link.title ?? link.url} className="mt-0.5" />}
            actions={actions}
          />
        </li>
      ))}
    </ul>
  );
}

function RowActions() {
  return (
    <>
      <StaticButton variant="ghost" size="icon" className="hidden lg:inline-flex">
        <ArrowUp />
      </StaticButton>
      <StaticButton variant="ghost" size="icon" className="hidden lg:inline-flex">
        <ArrowDown />
      </StaticButton>
      <StaticButton variant="ghost" size="icon">
        <MoreHorizontal />
      </StaticButton>
    </>
  );
}

/** Looks like a `Button` but is plain text: the preview has no controls. */
function StaticButton({
  variant,
  size,
  className,
  children,
}: VariantProps<typeof buttonVariants> & { className?: string; children: ReactNode }) {
  return <span className={cn(buttonVariants({ variant, size }), className)}>{children}</span>;
}
