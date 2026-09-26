"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const DATE_OPTIONS: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" };
const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 3600],
  ["month", 30 * 24 * 3600],
  ["week", 7 * 24 * 3600],
  ["day", 24 * 3600],
  ["hour", 3600],
  ["minute", 60],
];

/** "2 hours ago"; a future date (clock skew) reads as now. Minutes are the smallest unit. */
function relative(iso: string) {
  const seconds = Math.min(0, (new Date(iso).getTime() - Date.now()) / 1000);
  const format = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  for (const [unit, size] of UNITS) {
    if (-seconds >= size) return format.format(Math.round(seconds / size), unit);
  }
  return format.format(0, "second");
}

const utcDate = (iso: string) => new Date(iso).toLocaleDateString("en-US", { ...DATE_OPTIONS, timeZone: "UTC" });

/**
 * Relative time, exact date in `title`. Like `LocalDate`, the server (and hydration) render the
 * UTC date, so markup matches; the client then switches to the viewer's relative time.
 */
export function RelativeTime({ date, className }: { date: Date | string; className?: string }) {
  const iso = typeof date === "string" ? date : date.toISOString();
  const text = useSyncExternalStore(subscribe, () => relative(iso), () => utcDate(iso));
  const title = useSyncExternalStore(
    subscribe,
    () => new Date(iso).toLocaleString(undefined, { ...DATE_OPTIONS, hour: "numeric", minute: "2-digit" }),
    () => utcDate(iso)
  );

  return (
    <time dateTime={iso} title={title} className={className}>
      {text}
    </time>
  );
}
