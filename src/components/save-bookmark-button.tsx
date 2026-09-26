"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bookmark, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { SaveViewer } from "@/components/save-collection-button";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useActionForm } from "@/hooks/use-action-form";
import { copyCollectionSchema } from "@/lib/validations/collection";
import { copyCollection } from "@/server/actions/collection";

const SAVE_LABEL = "Save to my collections";

/**
 * Plan 8 §2.3: the card's icon version of "Save to my collections" (a copy). Owners see nothing;
 * signed out → sign in and come back to `returnPath`; not onboarded → onboarding. Members stay
 * on the page after saving: toast with "Open", then the bookmark is filled and inactive.
 */
export function SaveBookmarkButton({
  collectionId,
  viewer,
  saved: initialSaved,
  returnPath,
}: {
  collectionId: string;
  viewer: SaveViewer;
  saved: boolean;
  returnPath: string;
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const { pending, submit } = useActionForm({
    schema: copyCollectionSchema,
    action: copyCollection,
    onSuccess: ({ id }) => {
      setSaved(true);
      toast.success("Saved to your collections", {
        action: { label: "Open", onClick: () => router.push(`/app/collections/${id}`) },
      });
    },
  });

  if (viewer === "owner") return null;

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

  if (saved) {
    // aria-disabled (not disabled) keeps it focusable and hoverable, so the "Saved" tooltip still shows.
    return (
      <BookmarkTooltip label="Saved">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Saved"
          aria-disabled
          className="cursor-default hover:bg-transparent"
        >
          <Bookmark className="fill-current" />
        </Button>
      </BookmarkTooltip>
    );
  }

  return (
    <BookmarkTooltip label={SAVE_LABEL}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={SAVE_LABEL}
        disabled={pending}
        aria-busy={pending || undefined}
        onClick={() => submit({ sourceCollectionId: collectionId })}
      >
        {pending ? <Loader2 aria-hidden className="animate-spin" /> : <Bookmark />}
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
