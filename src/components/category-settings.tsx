"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { SubmitButton } from "@/components/submit-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useActionForm } from "@/hooks/use-action-form";
import { createCategorySchema, deleteCategorySchema } from "@/lib/validations/category";
import { createCategory, deleteCategory } from "@/server/actions/category";

type Category = { id: string; name: string };

/** Built-in categories (read-only) and the user's own (add / delete). */
export function CategorySettings({ system, own }: { system: Category[]; own: Category[] }) {
  const [name, setName] = useState("");
  const { pending, fieldErrors, submit } = useActionForm({
    schema: createCategorySchema,
    action: createCategory,
    successMessage: "Category created",
    onSuccess: () => setName(""),
  });

  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <p className="text-sm font-medium">Built-in</p>
        <div className="flex flex-wrap gap-2">
          {system.map((c) => (
            <Badge key={c.id} variant="secondary" className="font-medium">
              {c.name}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid gap-2">
        <p className="text-sm font-medium">Yours</p>
        {own.length === 0 ? (
          <p className="text-sm text-muted-foreground">No custom categories</p>
        ) : (
          <ul className="divide-y rounded-lg border">
            {own.map((c) => (
              <OwnCategoryRow key={c.id} category={c} />
            ))}
          </ul>
        )}
      </div>

      <form
        className="grid gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          submit({ name });
        }}
      >
        <Label htmlFor="new-category">New category</Label>
        <div className="flex gap-2">
          <Input
            id="new-category"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={30}
            autoComplete="off"
            aria-invalid={fieldErrors.name ? true : undefined}
            aria-describedby={fieldErrors.name ? "new-category-error" : undefined}
          />
          <SubmitButton pending={pending} variant="outline" className="shrink-0">
            Add
          </SubmitButton>
        </div>
        {fieldErrors.name && (
          <p id="new-category-error" className="text-sm text-destructive">
            {fieldErrors.name[0]}
          </p>
        )}
      </form>
    </div>
  );
}

function OwnCategoryRow({ category }: { category: Category }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const label = `Delete ${category.name}`;

  return (
    <li className="flex min-h-11 items-center justify-between gap-3 py-1 pr-1 pl-4">
      <span className="min-w-0 truncate text-sm">{category.name}</span>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button type="button" variant="ghost" size="icon" aria-label={label} onClick={() => setConfirmOpen(true)}>
            <Trash2 />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Delete “${category.name}”?`}
        description="It's removed from every collection and link that uses it."
        confirmLabel="Delete category"
        schema={deleteCategorySchema}
        action={deleteCategory}
        input={{ id: category.id }}
        onSuccess={() => toast.success("Category deleted")}
      />
    </li>
  );
}
