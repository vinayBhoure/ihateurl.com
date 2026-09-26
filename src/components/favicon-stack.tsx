import { Favicon } from "@/components/favicon";
import { cn } from "@/lib/utils";

type StackLink = { faviconUrl: string | null; domain: string | null };

/** First links' favicons in fixed boxes, plus `+N` for the rest. Nothing when there are no links. */
export function FaviconStack({
  links,
  total,
  className,
}: {
  links: StackLink[];
  total: number;
  className?: string;
}) {
  if (links.length === 0) return null;
  const more = total - links.length;

  return (
    <ul aria-label="Sites in this collection" className={cn("flex flex-wrap items-center gap-2", className)}>
      {links.map((link, i) => (
        <li
          key={i}
          title={link.domain ?? undefined}
          // Most favicons are drawn for light tab bars, so a loaded one sits on a light box in dark mode too.
          className="flex size-8 items-center justify-center rounded-md border bg-background dark:has-[img]:bg-foreground"
        >
          <Favicon src={link.faviconUrl} />
          {link.domain && <span className="sr-only">{link.domain}</span>}
        </li>
      ))}
      {more > 0 && (
        <li className="flex h-8 min-w-8 items-center justify-center rounded-md border bg-muted px-1.5 text-xs font-medium text-muted-foreground">
          +{more}
          <span className="sr-only"> more</span>
        </li>
      )}
    </ul>
  );
}
