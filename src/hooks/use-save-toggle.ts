"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useActionForm } from "@/hooks/use-action-form";
import { savedCollectionSchema } from "@/lib/validations/saved";
import { saveCollection, unsaveCollection } from "@/server/actions/saved";

/**
 * Plan 9 §2.4: save ↔ unsave for one collection (a bookmark, nothing is copied). Shared by the
 * card bookmark and the collection page button. The viewer stays on the page either way.
 */
export function useSaveToggle(collectionId: string, initialSaved: boolean) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const { pending, submit } = useActionForm({
    schema: savedCollectionSchema,
    action: saved ? unsaveCollection : saveCollection,
    onSuccess: () => {
      setSaved(!saved);
      if (saved) {
        toast.success("Removed from saved");
      } else {
        toast.success("Saved to your collections", {
          action: { label: "Open", onClick: () => router.push("/app/saved") },
        });
      }
    },
  });

  return { saved, pending, toggle: () => submit({ collectionId }) };
}
