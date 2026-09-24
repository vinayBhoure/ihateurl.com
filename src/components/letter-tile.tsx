import { cn } from "@/lib/utils";

/**
 * 16 px tile with the first letter of `text`, sized like `Favicon`. Used by the landing previews
 * instead of hotlinked favicons (LD3); the app keeps the `Globe` fallback (FP5).
 */
export function LetterTile({ text, className }: { text: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        // 10 px glyph: an icon inside a 16 px tile, not a text role.
        "flex size-4 shrink-0 items-center justify-center rounded-sm bg-muted text-[10px] leading-none font-semibold text-muted-foreground",
        className
      )}
    >
      {text.trim().charAt(0).toUpperCase()}
    </span>
  );
}
