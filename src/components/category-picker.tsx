"use client";

import { useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useActionForm } from "@/hooks/use-action-form";
import { MAX_CATEGORIES_PER_ITEM, createCategorySchema } from "@/lib/validations/category";
import { createCategory } from "@/server/actions/category";

export type CategoryOption = { id: string; name: string };

/**
 * FP6: checkbox list of system + own categories (max 5) with a "New category" field.
 * The field is not a nested <form>: submit events would bubble to the parent form through the portal.
 */
export function CategoryPicker({
  id,
  categories,
  value,
  onChange,
  container,
}: {
  id?: string;
  categories: CategoryOption[];
  value: string[];
  onChange: (ids: string[]) => void;
  /** Enclosing dialog's content node, if any — keeps the list scrolling inside the dialog. */
  container?: HTMLElement | null;
}) {
  const [created, setCreated] = useState<CategoryOption[]>([]);
  const [name, setName] = useState("");

  const options = [...categories, ...created.filter((c) => !categories.some((x) => x.id === c.id))].sort(
    (a, b) => a.name.localeCompare(b.name)
  );
  const selectedNames = options.filter((c) => value.includes(c.id)).map((c) => c.name);
  const full = value.length >= MAX_CATEGORIES_PER_ITEM;

  const { pending, fieldErrors, submit } = useActionForm({
    schema: createCategorySchema,
    action: createCategory,
    successMessage: "Category created",
    onSuccess: (category) => {
      setCreated((prev) => [...prev, category]);
      if (!full) onChange([...value, category.id]);
      setName("");
    },
  });

  function toggle(categoryId: string, checked: boolean) {
    onChange(checked ? [...value, categoryId] : value.filter((v) => v !== categoryId));
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button id={id} type="button" variant="outline" className="w-full justify-between font-normal">
          <span className="truncate">{selectedNames.length > 0 ? selectedNames.join(", ") : "Choose categories"}</span>
          <ChevronDown className="text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" container={container} className="w-(--radix-popover-trigger-width) min-w-64 p-0">
        <p className="border-b px-3 py-2 text-xs text-muted-foreground">
          {value.length}/{MAX_CATEGORIES_PER_ITEM} selected
        </p>
        <ul className="max-h-64 overflow-y-auto p-1">
          {options.map((c) => {
            const checked = value.includes(c.id);
            return (
              <li key={c.id}>
                <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-sm px-2 text-sm hover:bg-accent has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50 md:min-h-8">
                  <Checkbox
                    checked={checked}
                    disabled={!checked && full}
                    onCheckedChange={(state) => toggle(c.id, state === true)}
                  />
                  <span className="truncate">{c.name}</span>
                </label>
              </li>
            );
          })}
        </ul>
        <div className="grid gap-1 border-t p-2">
          <div className="flex gap-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                e.preventDefault();
                if (!pending) submit({ name });
              }}
              maxLength={30}
              placeholder="New category"
              aria-label="New category name"
              aria-invalid={fieldErrors.name ? true : undefined}
            />
            <SubmitButton
              type="button"
              variant="outline"
              size="icon"
              pending={pending}
              aria-label="Add category"
              onClick={() => submit({ name })}
            >
              {!pending && <Plus />}
            </SubmitButton>
          </div>
          {fieldErrors.name && <p className="px-1 text-xs text-destructive">{fieldErrors.name[0]}</p>}
        </div>
      </PopoverContent>
    </Popover>
  );
}
