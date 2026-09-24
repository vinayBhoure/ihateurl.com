"use client";

import { useState } from "react";
import { CategoryPicker, type CategoryOption } from "@/components/category-picker";
import { Field } from "@/components/form-field";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useActionForm } from "@/hooks/use-action-form";
import { updateLinkSchema } from "@/lib/validations/link";
import { updateLink } from "@/server/actions/link";

export type EditableLink = {
  id: string;
  title: string | null;
  description: string | null;
  categoryIds: string[];
};

/** Edits the link itself, so every collection holding it shows the change. */
export function LinkEditDialog({
  link,
  categories,
  open,
  onOpenChange,
}: {
  link: EditableLink;
  categories: CategoryOption[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit link</DialogTitle>
          <DialogDescription>Changes show in every collection with this link.</DialogDescription>
        </DialogHeader>
        <LinkEditForm link={link} categories={categories} onSaved={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function LinkEditForm({
  link,
  categories,
  onSaved,
}: {
  link: EditableLink;
  categories: CategoryOption[];
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(link.title ?? "");
  const [description, setDescription] = useState(link.description ?? "");
  const [categoryIds, setCategoryIds] = useState(link.categoryIds);
  const { pending, fieldErrors, submit } = useActionForm({
    schema: updateLinkSchema,
    action: updateLink,
    successMessage: "Link updated",
    onSuccess: onSaved,
  });

  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        submit({
          id: link.id,
          // A link saved without a title (metadata fetch failed) may stay untitled.
          title: title.trim() === "" && link.title === null ? undefined : title,
          description,
          categoryIds,
        });
      }}
    >
      <Field id="link-title" label="Title" error={fieldErrors.title?.[0]}>
        <Input
          id="link-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={300}
          autoComplete="off"
          aria-invalid={fieldErrors.title ? true : undefined}
          aria-describedby={fieldErrors.title ? "link-title-error" : undefined}
        />
      </Field>
      <Field
        id="link-description"
        label="Description (optional)"
        error={fieldErrors.description?.[0]}
        hint={`${description.length}/1000`}
      >
        <Textarea
          id="link-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={1000}
          rows={3}
          aria-invalid={fieldErrors.description ? true : undefined}
          aria-describedby={
            fieldErrors.description ? "link-description-error link-description-hint" : "link-description-hint"
          }
        />
      </Field>
      <Field id="link-categories" label="Categories" error={fieldErrors.categoryIds?.[0]}>
        <CategoryPicker id="link-categories" categories={categories} value={categoryIds} onChange={setCategoryIds} />
      </Field>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </DialogClose>
        <SubmitButton pending={pending}>Save</SubmitButton>
      </DialogFooter>
    </form>
  );
}
