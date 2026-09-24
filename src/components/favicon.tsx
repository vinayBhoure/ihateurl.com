"use client";

import { useState } from "react";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * FP5: hotlinked favicon (D8) at a fixed 16 px size; a globe icon when there is none or it fails.
 * The ref check catches images that failed before hydration, when `onError` was not attached yet.
 */
export function Favicon({ src, className }: { src?: string | null; className?: string }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (!src || failedSrc === src) {
    return <Globe aria-hidden className={cn("size-4 shrink-0 text-muted-foreground", className)} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- arbitrary external hosts, so no next/image (FP5)
    <img
      src={src}
      alt=""
      width={16}
      height={16}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      className={cn("size-4 shrink-0 rounded-sm", className)}
      onError={() => setFailedSrc(src)}
      ref={(img) => {
        if (img?.complete && img.naturalWidth === 0) setFailedSrc(src);
      }}
    />
  );
}
