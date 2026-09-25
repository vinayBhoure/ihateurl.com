import type { ReactNode } from "react";

export type LegalSection = { id: string; title: string; body: ReactNode };

/** Shared layout for /privacy and /terms (plan 4 R2): h1, date, contents list, numbered sections. */
export function LegalDocument({
  title,
  updated,
  updatedIso,
  intro,
  sections,
}: {
  title: string;
  updated: string;
  updatedIso: string;
  intro: ReactNode;
  sections: LegalSection[];
}) {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-8 px-4 py-12 md:px-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-[-0.015em]">{title}</h1>
        <p className="text-sm text-muted-foreground">
          Last updated <time dateTime={updatedIso}>{updated}</time>
        </p>
      </header>

      <div className="space-y-3 text-base">{intro}</div>

      <nav aria-labelledby="contents-heading" className="rounded-lg border p-4">
        <h2 id="contents-heading" className="text-sm font-medium">
          Contents
        </h2>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
          {sections.map((section) => (
            <li key={section.id}>
              <a href={`#${section.id}`} className="underline-offset-4 hover:underline">
                {section.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {sections.map((section, index) => (
        <section key={section.id} id={section.id} aria-labelledby={`${section.id}-heading`} className="scroll-mt-20 space-y-3">
          <h2 id={`${section.id}-heading`} className="text-xl font-semibold">
            {index + 1}. {section.title}
          </h2>
          <div className="space-y-3 text-base [&_li]:mt-1 [&_ul]:list-disc [&_ul]:pl-5">{section.body}</div>
        </section>
      ))}
    </div>
  );
}

/** Contact address published on the legal pages (owner, 2026-09-25). */
export const LEGAL_CONTACT = "bhoure21@gmail.com";

export function ContactLink() {
  return (
    <a href={`mailto:${LEGAL_CONTACT}`} className="font-medium underline underline-offset-4">
      {LEGAL_CONTACT}
    </a>
  );
}
