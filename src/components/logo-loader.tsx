import { LogoMark } from "@/components/logo";

/** Full-page wait: the logo mark with a slow pulse (none with reduced motion). Data lists use skeletons. */
export function LogoLoader({ label = "Loading…" }: { label?: string }) {
  return (
    <div role="status" className="flex flex-1 items-center justify-center py-24">
      <LogoMark className="h-10 w-auto animate-pulse text-foreground motion-reduce:animate-none" />
      <span className="sr-only">{label}</span>
    </div>
  );
}
