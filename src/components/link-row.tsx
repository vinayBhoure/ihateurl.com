import type { ReactNode } from "react";
import { Favicon } from "@/components/favicon";
import { Badge } from "@/components/ui/badge";

export type LinkRowData = {
  url: string;
  title: string | null;
  domain: string | null;
  faviconUrl: string | null;
  categories: { id: string; name: string }[];
};

/**
 * Favicon, title (opens the URL in a new tab), domain and categories. Read-only unless `actions`
 * is passed. Public pages pass `rel="noopener noreferrer nofollow ugc"` (Q3).
 */
export function LinkRow({
  link,
  actions,
  rel = "noopener noreferrer",
}: {
  link: LinkRowData;
  actions?: ReactNode;
  rel?: string;
}) {
  return (
    <div className="flex min-h-11 items-start gap-3 px-4 py-3">
      <Favicon src={link.faviconUrl} className="mt-0.5" />
      <div className="min-w-0 flex-1 space-y-1">
        <a
          href={link.url}
          target="_blank"
          rel={rel}
          className="block truncate text-sm font-medium underline-offset-4 hover:underline"
        >
          {link.title || link.domain || link.url}
        </a>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {link.domain && <span className="truncate font-mono text-xs text-muted-foreground">{link.domain}</span>}
          {link.categories.map((c) => (
            <Badge key={c.id} variant="secondary" className="px-1.5 font-medium">
              {c.name}
            </Badge>
          ))}
        </div>
      </div>
      {actions && <div className="-my-1 flex shrink-0 items-center gap-1">{actions}</div>}
    </div>
  );
}
