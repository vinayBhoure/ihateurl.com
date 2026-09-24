"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const OPTIONS: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" };

/** A date in the viewer's locale and time zone. The server (and hydration) render it in UTC. */
export function LocalDate({ date, className }: { date: Date | string; className?: string }) {
  const iso = typeof date === "string" ? date : date.toISOString();
  const text = useSyncExternalStore(
    subscribe,
    () => new Date(iso).toLocaleDateString(undefined, OPTIONS),
    () => new Date(iso).toLocaleDateString("en-US", { ...OPTIONS, timeZone: "UTC" })
  );

  return (
    <time dateTime={iso} className={className}>
      {text}
    </time>
  );
}
