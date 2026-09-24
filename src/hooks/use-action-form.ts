"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import type { ZodTypeAny } from "zod";
import type { ActionResult, FieldErrors } from "@/server/result";

type Options<T> = {
  /** Shared schema from `src/lib/validations/`; the server action validates again. */
  schema: ZodTypeAny;
  action: (input: unknown) => Promise<ActionResult<T>>;
  /** Toast on success; omit for none. */
  successMessage?: string;
  onSuccess?: (data: T) => void;
};

const NETWORK_ERROR = "Couldn't reach the server. Check your connection and try again.";

/**
 * FP1 form flow: client `safeParse` → server action in a transition → `ActionResult`.
 * The raw values go to the action because schemas may transform them and the server parses again.
 * A second submit while one is in flight is ignored.
 */
export function useActionForm<T>({ schema, action, successMessage, onSuccess }: Options<T>) {
  const [pending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const inFlight = useRef(false);

  function submit(input: FormData | Record<string, unknown>) {
    if (inFlight.current) return;

    const values = input instanceof FormData ? Object.fromEntries(input) : input;
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      setFieldErrors(parsed.error.flatten().fieldErrors as FieldErrors);
      return;
    }

    setFieldErrors({});
    inFlight.current = true;
    startTransition(async () => {
      try {
        const result = await action(values);
        if (!result.ok) {
          setFieldErrors(result.fieldErrors ?? {});
          toast.error(result.error);
          return;
        }
        if (successMessage) toast.success(successMessage);
        onSuccess?.(result.data);
      } catch {
        toast.error(NETWORK_ERROR);
      } finally {
        inFlight.current = false;
      }
    });
  }

  return { pending, fieldErrors, submit };
}
