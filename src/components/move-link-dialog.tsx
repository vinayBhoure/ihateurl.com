"use client";

import { useState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useActionForm } from "@/hooks/use-action-form";
import { moveLinkSchema } from "@/lib/validations/link";
import { moveLink } from "@/server/actions/link";

export type MoveTarget = { id: string; title: string };

/** Moves the item to another of the user's collections (merges if the link is already there). */
export function MoveLinkDialog({
  itemId,
  targets,
  open,
  onOpenChange,
}: {
  itemId: string;
  targets: MoveTarget[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move to…</DialogTitle>
          <DialogDescription>The link leaves this collection and joins the one you pick.</DialogDescription>
        </DialogHeader>
        {targets.length === 0 ? (
          <p className="text-sm text-muted-foreground">You have no other collections yet.</p>
        ) : (
          <MoveLinkForm itemId={itemId} targets={targets} onMoved={() => onOpenChange(false)} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function MoveLinkForm({
  itemId,
  targets,
  onMoved,
}: {
  itemId: string;
  targets: MoveTarget[];
  onMoved: () => void;
}) {
  const [targetCollectionId, setTargetCollectionId] = useState("");
  const { pending, submit } = useActionForm({
    schema: moveLinkSchema,
    action: moveLink,
    successMessage: "Link moved",
    onSuccess: onMoved,
  });

  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        submit({ itemId, targetCollectionId });
      }}
    >
      <div className="grid gap-2">
        <Label htmlFor="move-target">Collection</Label>
        <Select value={targetCollectionId} onValueChange={setTargetCollectionId}>
          <SelectTrigger id="move-target" className="w-full">
            <SelectValue placeholder="Choose a collection" />
          </SelectTrigger>
          <SelectContent>
            {targets.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </DialogClose>
        <SubmitButton pending={pending} disabled={targetCollectionId === ""}>
          Move
        </SubmitButton>
      </DialogFooter>
    </form>
  );
}
