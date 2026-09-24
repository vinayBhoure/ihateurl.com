"use client";

import { useRef, useState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActionForm } from "@/hooks/use-action-form";
import { ensureScheme } from "@/lib/url/ensure-scheme";
import { createLinkSchema } from "@/lib/validations/link";
import { createLink } from "@/server/actions/link";

/** Paste a URL, press Enter. The input clears only when the link was added. */
export function AddLinkForm({ collectionId }: { collectionId: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState("");
  const { pending, fieldErrors, submit } = useActionForm({
    schema: createLinkSchema,
    action: createLink,
    successMessage: "Link added",
    onSuccess: () => {
      setUrl("");
      inputRef.current?.focus();
    },
  });
  const error = fieldErrors.url?.[0];

  return (
    <form
      className="grid gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        submit({ collectionId, url: ensureScheme(url) });
      }}
    >
      <Label htmlFor="add-url" className="sr-only">
        Add a link
      </Label>
      <div className="flex gap-2">
        <Input
          ref={inputRef}
          id="add-url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          readOnly={pending}
          inputMode="url"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          maxLength={2048}
          placeholder="Paste a URL"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "add-url-error" : undefined}
        />
        <SubmitButton pending={pending} className="shrink-0">
          {pending ? "Fetching details…" : "Add"}
        </SubmitButton>
      </div>
      {error && (
        <p id="add-url-error" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </form>
  );
}
