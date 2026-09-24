"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useActionForm } from "@/hooks/use-action-form";
import { createCollectionSchema } from "@/lib/validations/collection";
import { createCollection } from "@/server/actions/collection";

/** FP3: "New collection" button + dialog. New collections are private; opens the new one on success. */
export function NewCollectionDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          New collection
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New collection</DialogTitle>
          <DialogDescription>It starts private. You can publish it later.</DialogDescription>
        </DialogHeader>
        {/* Rendered only while open, so errors and values reset on close. */}
        <CreateCollectionForm onCreated={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

function CreateCollectionForm({ onCreated }: { onCreated: () => void }) {
  const router = useRouter();
  const { pending, fieldErrors, submit } = useActionForm({
    schema: createCollectionSchema,
    action: createCollection,
    successMessage: "Collection created",
    onSuccess: ({ id }) => {
      onCreated();
      router.push(`/app/collections/${id}`);
    },
  });

  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        submit(new FormData(e.currentTarget));
      }}
    >
      <Field id="title" label="Title" error={fieldErrors.title?.[0]}>
        <Input
          id="title"
          name="title"
          required
          maxLength={100}
          autoComplete="off"
          aria-invalid={fieldErrors.title ? true : undefined}
          aria-describedby={fieldErrors.title ? "title-error" : undefined}
        />
      </Field>
      <Field id="description" label="Description (optional)" error={fieldErrors.description?.[0]}>
        <Textarea
          id="description"
          name="description"
          maxLength={500}
          rows={3}
          aria-invalid={fieldErrors.description ? true : undefined}
          aria-describedby={fieldErrors.description ? "description-error" : undefined}
        />
      </Field>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </DialogClose>
        <SubmitButton pending={pending}>Create</SubmitButton>
      </DialogFooter>
    </form>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
