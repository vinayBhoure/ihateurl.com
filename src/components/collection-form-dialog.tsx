"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus } from "lucide-react";
import { CategoryPicker, type CategoryOption } from "@/components/category-picker";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useActionForm } from "@/hooks/use-action-form";
import { createCollectionSchema, updateCollectionSchema } from "@/lib/validations/collection";
import { createCollection, updateCollection } from "@/server/actions/collection";

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

export type EditableCollection = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  visibility: "PRIVATE" | "PUBLIC";
  categoryIds: string[];
};

/** Edit title, slug, description, categories and visibility. The page stays on /app/collections/[id]. */
export function EditCollectionDialog({
  collection,
  username,
  categories,
}: {
  collection: EditableCollection;
  username: string;
  categories: CategoryOption[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" aria-label="Edit collection" className="max-md:size-11 max-md:px-0">
          <Pencil />
          <span className="max-md:sr-only">Edit</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit collection</DialogTitle>
          <DialogDescription>Changes apply to the public page too.</DialogDescription>
        </DialogHeader>
        <EditCollectionForm
          collection={collection}
          username={username}
          categories={categories}
          onSaved={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function EditCollectionForm({
  collection,
  username,
  categories,
  onSaved,
}: {
  collection: EditableCollection;
  username: string;
  categories: CategoryOption[];
  onSaved: () => void;
}) {
  const [isPublic, setIsPublic] = useState(collection.visibility === "PUBLIC");
  const [categoryIds, setCategoryIds] = useState(collection.categoryIds);
  const [description, setDescription] = useState(collection.description ?? "");

  // The action revalidates this page, so the header refreshes without router.refresh().
  const { pending, fieldErrors, submit } = useActionForm({
    schema: updateCollectionSchema,
    action: updateCollection,
    successMessage: "Collection updated",
    onSuccess: onSaved,
  });

  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        submit({
          id: collection.id,
          title: form.get("title"),
          slug: form.get("slug"),
          description,
          visibility: isPublic ? "PUBLIC" : "PRIVATE",
          categoryIds,
        });
      }}
    >
      <Field id="title" label="Title" error={fieldErrors.title?.[0]}>
        <Input
          id="title"
          name="title"
          defaultValue={collection.title}
          required
          maxLength={100}
          autoComplete="off"
          aria-invalid={fieldErrors.title ? true : undefined}
          aria-describedby={fieldErrors.title ? "title-error" : undefined}
        />
      </Field>

      <Field id="slug" label="URL" error={fieldErrors.slug?.[0]} hint="Old links stop working if you change it.">
        <div className="flex h-11 min-w-0 items-center rounded-md border border-input focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background md:h-9">
          <span aria-hidden className="max-w-[55%] truncate pl-3 font-mono text-sm text-muted-foreground">
            ihateurl.com/{username}/
          </span>
          <Input
            id="slug"
            name="slug"
            defaultValue={collection.slug}
            required
            maxLength={60}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            aria-invalid={fieldErrors.slug ? true : undefined}
            aria-describedby={fieldErrors.slug ? "slug-error slug-hint" : "slug-hint"}
            className="h-full min-w-0 border-0 pl-0 font-mono focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
      </Field>

      <Field
        id="description"
        label="Description (optional)"
        error={fieldErrors.description?.[0]}
        hint={`${description.length}/500`}
      >
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={500}
          rows={3}
          aria-invalid={fieldErrors.description ? true : undefined}
          aria-describedby={fieldErrors.description ? "description-error description-hint" : "description-hint"}
        />
      </Field>

      <Field id="categories" label="Categories" error={fieldErrors.categoryIds?.[0]}>
        <CategoryPicker id="categories" categories={categories} value={categoryIds} onChange={setCategoryIds} />
      </Field>

      <div className="flex items-center justify-between gap-4 rounded-lg border px-3 py-2">
        <div className="space-y-0.5">
          <Label htmlFor="public">Public</Label>
          <p id="public-hint" className="text-xs text-muted-foreground">
            Anyone with the link can view it, and it can appear in Explore.
          </p>
        </div>
        <Switch id="public" checked={isPublic} onCheckedChange={setIsPublic} aria-describedby="public-hint" />
      </div>

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

function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid min-w-0 gap-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      )}
      {hint && (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  );
}
