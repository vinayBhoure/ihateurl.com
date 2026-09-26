"use client";

import { useState } from "react";
import { Field } from "@/components/form-field";
import { PrefixedInput } from "@/components/prefixed-input";
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
        <PrefixedInput
          id="username"
          name="username"
          prefix="ihateurl.com/u/"
          defaultValue={user.username}
          required
          maxLength={30}
          aria-invalid={fieldErrors.username ? true : undefined}
          aria-describedby={fieldErrors.username ? "username-error username-hint" : "username-hint"}
        />
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
