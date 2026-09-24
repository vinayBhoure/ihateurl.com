"use client";

import type { ZodTypeAny } from "zod";
import { SubmitButton } from "@/components/submit-button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useActionForm } from "@/hooks/use-action-form";
import type { ActionResult } from "@/server/result";

/** Destructive confirmation (§4.7 rule 6); stays open while the action runs. */
export function ConfirmDialog<T>({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  schema,
  action,
  input,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  schema: ZodTypeAny;
  action: (input: unknown) => Promise<ActionResult<T>>;
  input: Record<string, unknown>;
  onSuccess: (data: T) => void;
}) {
  const { pending, submit } = useActionForm({
    schema,
    action,
    onSuccess: (data) => {
      onOpenChange(false);
      onSuccess(data);
    },
  });

  return (
    <AlertDialog open={open} onOpenChange={(next) => !pending && onOpenChange(next)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <SubmitButton type="button" variant="destructive" pending={pending} onClick={() => submit(input)}>
            {confirmLabel}
          </SubmitButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
