"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActionForm } from "@/hooks/use-action-form";
import { onboardingSchema } from "@/lib/validations/onboarding";
import { usernameSchema } from "@/lib/validations/username";
import { checkUsername, completeOnboarding } from "@/server/actions/profile";

type Status =
  | { state: "idle" }
  | { state: "checking" }
  | { state: "available"; username: string }
  | { state: "unavailable"; reason: string };

const CHECK_DELAY_MS = 400;

export function OnboardingForm({ defaultDisplayName }: { defaultDisplayName: string }) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const [submittedUsername, setSubmittedUsername] = useState<string | null>(null);
  const latestCheck = useRef(0);

  const { pending, fieldErrors, submit } = useActionForm({
    schema: onboardingSchema,
    action: completeOnboarding,
    onSuccess: () => router.replace("/app"),
  });

  // Live status: format and reserved names are checked locally, "taken" on the server.
  // Only the newest request may update the status, so slow responses can't overwrite it.
  useEffect(() => {
    const id = ++latestCheck.current;
    if (username.trim() === "") return;

    const timer = setTimeout(async () => {
      const parsed = usernameSchema.safeParse(username);
      if (!parsed.success) {
        setStatus({ state: "unavailable", reason: parsed.error.issues[0].message });
        return;
      }
      setStatus({ state: "checking" });
      try {
        const result = await checkUsername(parsed.data);
        if (id !== latestCheck.current) return;
        if (!result.ok) setStatus({ state: "idle" });
        else if (result.data.available) setStatus({ state: "available", username: parsed.data });
        else setStatus({ state: "unavailable", reason: result.data.reason ?? "Not available." });
      } catch {
        if (id === latestCheck.current) setStatus({ state: "idle" });
      }
    }, CHECK_DELAY_MS);

    return () => clearTimeout(timer);
  }, [username]);

  // A submit error is shown until the username is edited; after that the live status is fresher.
  const usernameError = submittedUsername === username ? fieldErrors.username?.[0] : undefined;

  return (
    <form
      className="grid gap-6"
      onSubmit={(e) => {
        e.preventDefault();
        setSubmittedUsername(username);
        submit(new FormData(e.currentTarget));
      }}
    >
      <div className="grid gap-2">
        <Label htmlFor="username">Username</Label>
        <div className="flex h-11 items-center rounded-md border border-input focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background md:h-9">
          <span aria-hidden className="pl-3 font-mono text-sm text-muted-foreground">
            ihateurl.com/u/
          </span>
          <Input
            id="username"
            name="username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setStatus({ state: "idle" });
            }}
            required
            maxLength={30}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            aria-invalid={usernameError ? true : undefined}
            aria-describedby="username-status"
            className="h-full border-0 pl-0 font-mono focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
        <UsernameStatus id="username-status" status={status} error={usernameError} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="displayName">Display name</Label>
        <Input
          id="displayName"
          name="displayName"
          defaultValue={defaultDisplayName}
          maxLength={60}
          aria-invalid={fieldErrors.displayName ? true : undefined}
          aria-describedby={fieldErrors.displayName ? "displayName-error" : undefined}
        />
        {fieldErrors.displayName && (
          <p id="displayName-error" className="text-sm text-destructive">
            {fieldErrors.displayName[0]}
          </p>
        )}
      </div>

      <SubmitButton pending={pending} className="w-full">
        Continue
      </SubmitButton>
    </form>
  );
}

function UsernameStatus({ id, status, error }: { id: string; status: Status; error?: string }) {
  let content: ReactNode = "3–30 lowercase letters, numbers, - or _.";
  let tone = "text-muted-foreground";

  if (error) {
    content = error;
    tone = "text-destructive";
  } else if (status.state === "checking") {
    content = (
      <>
        <Loader2 aria-hidden className="size-3.5 animate-spin" /> Checking…
      </>
    );
  } else if (status.state === "available") {
    content = (
      <>
        <Check aria-hidden className="size-3.5" />
        <span className="font-mono">ihateurl.com/u/{status.username}</span> is available
      </>
    );
    tone = "text-success";
  } else if (status.state === "unavailable") {
    content = status.reason;
    tone = "text-destructive";
  }

  return (
    <p id={id} aria-live="polite" className={`flex min-h-5 items-center gap-1.5 text-sm ${tone}`}>
      {content}
    </p>
  );
}
