import type { ReactElement } from "react";
import { resend } from "@/config/resend";
import WelcomeEmail, { type WelcomeEmailProps } from "@/emails/templates/welcome";

/**
 * Registry of available email templates.
 *
 * Add a new template by: (1) creating a `src/emails/templates/<name>.tsx`
 * file exporting a React Email component, and (2) adding an entry here
 * mapping its name to that component. `sendEmail` then picks up the new
 * template automatically, fully typed.
 */
const templates = {
  welcome: WelcomeEmail,
} as const;

type Templates = typeof templates;
export type EmailTemplate = keyof Templates;

type PropsFor<T extends EmailTemplate> = Templates[T] extends (
  props: infer P,
) => ReactElement
  ? P
  : never;

interface SendEmailResult {
  ok: boolean;
  id?: string;
  error?: string;
}

/**
 * Sends a transactional email using a React Email template.
 *
 * `from` always comes from the `EMAIL_FROM` env var — it is never a
 * caller-supplied parameter, so every email sent through this app uses
 * one consistent, verified sender address.
 *
 * This is a plain function you call explicitly wherever you need it
 * (e.g. inside a Server Action after your own signup logic runs). It is
 * NOT wired to fire automatically on any Clerk event.
 *
 * Example:
 *   await sendEmail("user@example.com", "welcome", { name: "Ada" });
 */
export async function sendEmail<T extends EmailTemplate>(
  to: string,
  template: T,
  props: PropsFor<T>,
): Promise<SendEmailResult> {
  const from = process.env.EMAIL_FROM;

  if (!from) {
    return { ok: false, error: "EMAIL_FROM is not set" };
  }

  const Template = templates[template];
  const subject = subjects[template];

  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      react: Template(props as any),
    });

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, id: data?.id };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to send email",
    };
  }
}

const subjects: Record<EmailTemplate, string> = {
  welcome: "Welcome aboard!",
};

// Re-exported so callers can import prop types alongside `sendEmail` if useful.
export type { WelcomeEmailProps };
