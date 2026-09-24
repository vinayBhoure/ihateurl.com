import { unstable_rethrow } from "next/navigation";

export type ErrorCode =
  | "UNAUTHORIZED"
  | "NOT_ONBOARDED"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "VALIDATION";

export type FieldErrors = Record<string, string[]>;

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: FieldErrors };

const DEFAULT_MESSAGES: Record<ErrorCode, string> = {
  UNAUTHORIZED: "Please sign in again.",
  NOT_ONBOARDED: "Finish setting up your profile first.",
  NOT_FOUND: "Not found.",
  CONFLICT: "That already exists.",
  RATE_LIMITED: "Too many requests. Try again in a minute.",
  VALIDATION: "Please check the highlighted fields.",
};

const GENERIC_MESSAGE = "Something went wrong. Please try again.";

/** `message` is shown to the user, so it must never contain internal details. */
export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message?: string,
    public readonly fieldErrors?: FieldErrors
  ) {
    super(message ?? DEFAULT_MESSAGES[code]);
    this.name = "AppError";
  }
}

export function ok<T>(data: T): ActionResult<T> {
  return { ok: true, data };
}

/** Clerk's `auth.protect()` signals "signed out" in a server action with Next's 401 interrupt. */
function isUnauthorizedInterrupt(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "digest" in err &&
    err.digest === "NEXT_HTTP_ERROR_FALLBACK;401"
  );
}

export function toActionResult(err: unknown): ActionResult<never> {
  if (isUnauthorizedInterrupt(err)) {
    return { ok: false, error: DEFAULT_MESSAGES.UNAUTHORIZED };
  }
  unstable_rethrow(err);
  if (err instanceof AppError) {
    return err.fieldErrors
      ? { ok: false, error: err.message, fieldErrors: err.fieldErrors }
      : { ok: false, error: err.message };
  }
  console.error("[action] unexpected error", err);
  return { ok: false, error: GENERIC_MESSAGE };
}
