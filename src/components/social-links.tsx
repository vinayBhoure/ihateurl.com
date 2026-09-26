import { SocialIcon } from "@/components/social-icon";
import { buttonVariants } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  SOCIAL_PLATFORM_CONFIG,
  isHandlePlatform,
  type SocialPlatform,
} from "@/lib/social-platforms";
import { cn } from "@/lib/utils";

function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** "{name} on GitHub" for handle platforms; the domain for Website and Other. */
function linkLabel(platform: SocialPlatform, url: string, ownerName: string): string {
  return isHandlePlatform(platform)
    ? `${ownerName} on ${SOCIAL_PLATFORM_CONFIG[platform].longLabel}`
    : domainOf(url);
}

/**
 * Plan 7: a profile's social links as icon buttons. `url` must come from `buildUrl`,
 * never raw input. Renders nothing when there are no links.
 */
export function SocialLinks({
  links,
  ownerName,
  className,
}: {
  links: { platform: SocialPlatform; url: string }[];
  ownerName: string;
  className?: string;
}) {
  if (links.length === 0) return null;

  return (
    <ul aria-label="Social links" className={cn("flex flex-wrap items-center gap-1", className)}>
      {links.map(({ platform, url }, index) => {
        const label = linkLabel(platform, url, ownerName);
        return (
          <li key={`${platform}-${index}`}>
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href={url}
                  target="_blank"
                  rel="me nofollow ugc noopener noreferrer"
                  aria-label={label}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon" }),
                    "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <SocialIcon platform={platform} />
                </a>
              </TooltipTrigger>
              <TooltipContent>{label}</TooltipContent>
            </Tooltip>
          </li>
        );
      })}
    </ul>
  );
}
