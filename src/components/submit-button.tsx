"use client";

import { Loader2 } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";

/** Disabled with a spinner while `pending`, so a form can't be sent twice. */
export function SubmitButton({
  pending,
  disabled,
  children,
  ...props
}: ButtonProps & { pending: boolean }) {
  return (
    <Button type="submit" disabled={pending || disabled} aria-busy={pending || undefined} {...props}>
      {pending && <Loader2 className="animate-spin" aria-hidden />}
      {children}
    </Button>
  );
}
