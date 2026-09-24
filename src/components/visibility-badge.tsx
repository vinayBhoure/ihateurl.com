import { Globe2, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function VisibilityBadge({ visibility }: { visibility: "PRIVATE" | "PUBLIC" }) {
  if (visibility === "PUBLIC") {
    return (
      <Badge variant="outline" className="gap-1 font-medium">
        <span aria-hidden className="size-1.5 rounded-full bg-success" />
        <Globe2 aria-hidden className="size-3.5" />
        Public
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="gap-1 font-medium">
      <Lock aria-hidden className="size-3.5" />
      Private
    </Badge>
  );
}
