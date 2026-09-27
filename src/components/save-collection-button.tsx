"use client";

import Link from "next/link";
import { Bookmark } from "lucide-react";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { useSaveToggle } from "@/hooks/use-save-toggle";

export type SaveViewer = "signed-out" | "not-onboarded" | "owner" | "member";

/**
 * Plan 9 §2.4: the collection page's "Save" / "Saved" toggle (a bookmark). Signed out → sign in
 * and come back; not onboarded → onboarding; owner → hidden; members toggle and stay on the page.
 * Hidden when saving is off (`canSave`) and it isn't already saved.
 */
export function SaveCollectionButton({
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
      <Button asChild>
        <Link href={href}>
          <Bookmark />
          Save
        </Link>
      </Button>
    );
  }

  return (
    <SubmitButton
      type="button"
      variant={saved ? "outline" : "default"}
      pending={pending}
      aria-pressed={saved}
      onClick={toggle}
    >
      {!pending && <Bookmark className={saved ? "fill-current" : undefined} />}
      {saved ? "Saved" : "Save"}
    </SubmitButton>
  );
}
