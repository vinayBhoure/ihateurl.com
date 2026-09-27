"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Bookmark, Loader2 } from "lucide-react";
import type { SaveViewer } from "@/components/save-collection-button";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useSaveToggle } from "@/hooks/use-save-toggle";

const SAVE_LABEL = "Save collection";

/**
 * Plan 9 §2.4: the card's icon toggle for saving a collection (a bookmark). Owners see nothing;
 * signed out → sign in and come back to `returnPath`; not onboarded → onboarding. Members toggle
 * in place: filled = saved. Hidden when saving is off (`canSave`) and it isn't already saved.
 */
export function SaveBookmarkButton({
  collectionId,
  viewer,
  saved: initialSaved,
  canSave,
  returnPath,
}: {
  collectionId: string;
  viewer: SaveViewer;
  saved: boolean;
  canSave: boolean;
  returnPath: string;
}) {
  const { saved, pending, toggle } = useSaveToggle(collectionId, initialSaved);

  if (viewer === "owner" || (!saved && !canSave)) return null;

  if (viewer !== "member") {
    const href =
      viewer === "signed-out" ? `/login?redirect_url=${encodeURIComponent(returnPath)}` : "/app/onboarding";
    return (
      <BookmarkTooltip label={SAVE_LABEL}>
        <Button asChild variant="ghost" size="icon" aria-label={SAVE_LABEL}>
          <Link href={href}>
            <Bookmark />
          </Link>
        </Button>
      </BookmarkTooltip>
    );
  }

  return (
    <BookmarkTooltip label={saved ? "Remove from saved" : SAVE_LABEL}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={SAVE_LABEL}
        aria-pressed={saved}
        disabled={pending}
        aria-busy={pending || undefined}
        onClick={toggle}
      >
        {pending ? (
          <Loader2 aria-hidden className="animate-spin" />
        ) : (
          <Bookmark className={saved ? "fill-current" : undefined} />
        )}
      </Button>
    </BookmarkTooltip>
  );
}

function BookmarkTooltip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
