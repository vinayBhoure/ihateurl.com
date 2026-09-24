"use client";

import { useSyncExternalStore } from "react";
import { Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const subscribe = () => () => {};
const canShare = () => typeof navigator.share === "function";

/** Native share sheet. Renders nothing where `navigator.share` is missing (and on the server). */
export function ShareButton({
  title,
  url,
  label = "Share",
  variant = "outline",
}: {
  title: string;
  url: string;
  label?: string;
  variant?: ButtonProps["variant"];
}) {
  const supported = useSyncExternalStore(subscribe, canShare, () => false);

  async function share() {
    try {
      await navigator.share({ title, url });
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      toast.error("Couldn't share. Copy the link instead.");
    }
  }

  if (!supported) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button type="button" variant={variant} size="icon" aria-label={label} onClick={share}>
          <Share2 />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
