"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookmarkPlus } from "lucide-react";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { useActionForm } from "@/hooks/use-action-form";
import { copyCollectionSchema } from "@/lib/validations/collection";
import { copyCollection } from "@/server/actions/collection";

export type SaveViewer = "signed-out" | "not-onboarded" | "owner" | "member";

/**
 * P4 "Save to my collections". Signed out → sign in and come back; not onboarded → onboarding;
 * owner → hidden; otherwise copies it as a private collection and opens the copy.
 */
export function SaveCollectionButton({
  collectionId,
  viewer,
  returnPath,
}: {
  collectionId: string;
  viewer: SaveViewer;
  returnPath: string;
}) {
  const router = useRouter();
  const { pending, submit } = useActionForm({
    schema: copyCollectionSchema,
    action: copyCollection,
    successMessage: "Saved to your collections",
    onSuccess: ({ id }) => router.push(`/app/collections/${id}`),
  });

  if (viewer === "owner") return null;

  if (viewer !== "member") {
    const href =
      viewer === "signed-out" ? `/login?redirect_url=${encodeURIComponent(returnPath)}` : "/app/onboarding";
    return (
      <Button asChild>
        <Link href={href}>
          <BookmarkPlus />
          Save to my collections
        </Link>
      </Button>
    );
  }

  return (
    <SubmitButton type="button" pending={pending} onClick={() => submit({ sourceCollectionId: collectionId })}>
      {!pending && <BookmarkPlus />}
      Save to my collections
    </SubmitButton>
  );
}
