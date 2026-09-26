import {
  Briefcase,
  Clapperboard,
  FlaskConical,
  Folder,
  GraduationCap,
  HeartPulse,
  ListChecks,
  Newspaper,
  Palette,
  Terminal,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Plan 8 §2.2: icon by the collection's first system category (seeded names), `Folder` otherwise.
const ICONS: Record<string, LucideIcon> = {
  Business: Briefcase,
  Design: Palette,
  Entertainment: Clapperboard,
  Finance: Wallet,
  Health: HeartPulse,
  Learning: GraduationCap,
  News: Newspaper,
  Productivity: ListChecks,
  Science: FlaskConical,
  Technology: Terminal,
};

// Full class names so Tailwind generates them. The only place tile accents are allowed (ui.md §1).
const TONES = [
  "bg-tile-1 text-tile-1-foreground",
  "bg-tile-2 text-tile-2-foreground",
  "bg-tile-3 text-tile-3-foreground",
  "bg-tile-4 text-tile-4-foreground",
  "bg-tile-5 text-tile-5-foreground",
];

/** Same id → same colour on every page and render. */
function toneFor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return TONES[hash % TONES.length];
}

/** Decorative icon block on a collection card. */
export function CollectionTile({
  id,
  category,
  className,
}: {
  id: string;
  category?: string | null;
  className?: string;
}) {
  const Icon = (category && ICONS[category]) || Folder;
  return (
    <span
      aria-hidden
      className={cn("flex size-12 shrink-0 items-center justify-center rounded-lg", toneFor(id), className)}
    >
      <Icon className="size-6" />
    </span>
  );
}
