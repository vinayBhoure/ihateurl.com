import { ExternalLink } from "lucide-react";
import { CopyButton } from "@/components/copy-button";
import { ShareButton } from "@/components/share-button";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

/** Public URL (mono) with copy, native share and open-in-new-tab (§5.4). */
export function PublicLinkBar({ url, title }: { url: string; title: string }) {
  return (
    <div className="flex items-center gap-1 rounded-lg border py-1 pr-1 pl-3">
      <span className="min-w-0 flex-1 truncate font-mono text-sm">{url.replace(/^https?:\/\//, "")}</span>
      <CopyButton value={url} label="Copy public link" variant="ghost" />
      <ShareButton title={title} url={url} variant="ghost" />
      <Tooltip>
        <TooltipTrigger asChild>
          <Button asChild variant="ghost" size="icon">
            <a href={url} target="_blank" rel="noopener noreferrer" aria-label="Open public page">
              <ExternalLink />
            </a>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Open public page</TooltipContent>
      </Tooltip>
    </div>
  );
}
