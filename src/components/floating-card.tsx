import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Small tilted "window" mockup used as hero decoration.
 * Purely visual — hidden below `lg` so it never fights the real content for space.
 */
export function FloatingCard({
  className,
  title,
  children,
}: {
  className?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "absolute hidden w-56 rounded-xl border border-black/5 bg-white/90 p-3 text-left shadow-xl shadow-black/5 backdrop-blur-sm lg:block",
        className
      )}
    >
      <div className="mb-2 flex items-center gap-1.5">
        <span className="size-2 rounded-full bg-red-300" />
        <span className="size-2 rounded-full bg-amber-300" />
        <span className="size-2 rounded-full bg-emerald-300" />
        <span className="ml-1.5 text-[10px] font-medium text-neutral-400">{title}</span>
      </div>
      <div className="font-mono text-[11px] leading-relaxed text-neutral-600">{children}</div>
    </div>
  );
}
