"use client";

import { useState } from "react";
import { Field } from "@/components/form-field";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useActionForm } from "@/hooks/use-action-form";
import { updateProfileSchema } from "@/lib/validations/profile";
import { updateProfile } from "@/server/actions/profile";

/** Username, display name and bio. Empty display name or bio clears it. */
export function ProfileForm({
  user,
}: {
  user: { username: string; displayName: string | null; bio: string | null };
}) {
  const [bio, setBio] = useState(user.bio ?? "");
  const { pending, fieldErrors, submit } = useActionForm({
    schema: updateProfileSchema,
    action: updateProfile,
    successMessage: "Profile saved",
  });

  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        submit({ username: form.get("username"), displayName: form.get("displayName"), bio });
      }}
    >
      <Field
        id="username"
        label="Username"
        error={fieldErrors.username?.[0]}
        hint="Changing it moves your public pages; links to the old address stop working."
      >
        <div className="flex h-11 min-w-0 items-center rounded-md border border-input focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background md:h-9">
          <span aria-hidden className="pl-3 font-mono text-sm text-muted-foreground">
            ihateurl.com/u/
          </span>
          <Input
            id="username"
            name="username"
            defaultValue={user.username}
            required
            maxLength={30}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            aria-invalid={fieldErrors.username ? true : undefined}
            aria-describedby={fieldErrors.username ? "username-error username-hint" : "username-hint"}
            className="h-full min-w-0 border-0 pl-0 font-mono focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
      </Field>

      <Field id="displayName" label="Display name" error={fieldErrors.displayName?.[0]}>
        <Input
          id="displayName"
          name="displayName"
          defaultValue={user.displayName ?? ""}
          maxLength={60}
          aria-invalid={fieldErrors.displayName ? true : undefined}
          aria-describedby={fieldErrors.displayName ? "displayName-error" : undefined}
        />
      </Field>

      <Field id="bio" label="Bio" error={fieldErrors.bio?.[0]} hint={`${bio.length}/280`}>
        <Textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={280}
          rows={3}
          aria-invalid={fieldErrors.bio ? true : undefined}
          aria-describedby={fieldErrors.bio ? "bio-error bio-hint" : "bio-hint"}
        />
      </Field>

      <div>
        <SubmitButton pending={pending}>Save profile</SubmitButton>
      </div>
    </form>
  );
}
