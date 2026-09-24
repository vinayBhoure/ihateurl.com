export type ErrorCode =
  | "UNAUTHORIZED"
  | "NOT_ONBOARDED"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "VALIDATION";

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message?: string
  ) {
    super(message ?? code);
    this.name = "AppError";
  }
}
