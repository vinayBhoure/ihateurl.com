import { Resend } from "resend";

/**
 * Resend client singleton.
 *
 * Resend covers transactional email that Clerk itself does not send —
 * for example a post-signup welcome email. Clerk's own hosted auth UI
 * already handles verification codes, magic links, and password resets,
 * so this client is never used to duplicate those.
 */
const globalForResend = globalThis as unknown as {
  resend: Resend | undefined;
};

export const resend =
  globalForResend.resend ??
  new Resend(process.env.RESEND_API_KEY);

if (process.env.NODE_ENV !== "production") {
  globalForResend.resend = resend;
}
