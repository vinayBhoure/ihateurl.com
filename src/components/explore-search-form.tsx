"use client";

import { useEffect, useRef, useState } from "react";
import Form from "next/form";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { PublicSuggestion } from "@/server/queries/public";

const DEBOUNCE_MS = 200;
const MIN_CHARS = 2;
const LISTBOX_ID = "explore-suggestions";

/** C3.4: /explore search input with a debounced suggestion dropdown (ARIA combobox). */
export function ExploreSearchForm({ defaultValue, category }: { defaultValue: string; category?: string }) {
  const router = useRouter();
  const [q, setQ] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<PublicSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const trimmed = q.trim();
    const timer = setTimeout(() => {
      if (trimmed.length < MIN_CHARS) {
        setSuggestions([]);
        setOpen(false);
        return;
      }
      const controller = new AbortController();
      abortRef.current = controller;
      fetch(`/api/explore/suggest?q=${encodeURIComponent(trimmed)}`, { signal: controller.signal })
        .then((res) => (res.ok ? res.json() : { results: [] }))
        .then((data: { results: PublicSuggestion[] }) => {
          setSuggestions(data.results);
          setOpen(data.results.length > 0);
          setActiveIndex(-1);
        })
        .catch((err: unknown) => {
          if (!(err instanceof DOMException && err.name === "AbortError")) setSuggestions([]);
        });
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
      abortRef.current?.abort();
    };
  }, [q]);

  function go(url: string) {
    setOpen(false);
    router.push(url);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      go(suggestions[activeIndex].url);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <Form action="/explore" role="search" className="flex max-w-xl gap-2">
      {category && <input type="hidden" name="category" value={category} />}
      <div className="relative flex-1">
        <Search
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          type="search"
          name="q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 100)}
          role="combobox"
          aria-expanded={open}
          aria-controls={LISTBOX_ID}
          aria-autocomplete="list"
          aria-activedescendant={activeIndex >= 0 ? `${LISTBOX_ID}-${activeIndex}` : undefined}
          maxLength={100}
          placeholder="Search public collections"
          aria-label="Search public collections"
          autoComplete="off"
          className="pl-9"
        />
        {open && (
          <ul
            id={LISTBOX_ID}
            role="listbox"
            className="absolute z-10 mt-1 w-full rounded-lg border bg-popover p-1 shadow-sm"
          >
            {suggestions.map((s, i) => (
              <li
                key={s.url}
                id={`${LISTBOX_ID}-${i}`}
                role="option"
                aria-selected={i === activeIndex}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => go(s.url)}
                className={cn(
                  "flex min-h-11 cursor-pointer flex-col justify-center rounded-sm px-3 md:min-h-8",
                  i === activeIndex ? "bg-accent" : "hover:bg-accent"
                )}
              >
                <span className="truncate text-sm font-medium">{s.title}</span>
                <span className="truncate font-mono text-xs text-muted-foreground">@{s.username}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Button type="submit" variant="outline">
        Search
      </Button>
    </Form>
  );
}
