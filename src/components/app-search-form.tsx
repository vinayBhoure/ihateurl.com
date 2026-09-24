"use client";

import Form from "next/form";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/** GET `/app/search?q=` (P5) with client-side navigation. */
export function AppSearchForm({
  className,
  onSubmit,
  defaultValue,
  autoFocus,
}: {
  className?: string;
  onSubmit?: () => void;
  defaultValue?: string;
  autoFocus?: boolean;
}) {
  return (
    <Form action="/app/search" role="search" className={cn("relative", className)} onSubmit={onSubmit}>
      <Search
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        type="search"
        name="q"
        defaultValue={defaultValue}
        autoFocus={autoFocus}
        maxLength={100}
        placeholder="Search"
        aria-label="Search your collections and links"
        className="pl-9"
      />
    </Form>
  );
}
