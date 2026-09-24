"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

/** Copies `value` to the clipboard; shows a check for 2 s. */
export function CopyButton({
  value,
  label = "Copy link",
  variant = "outline",
}: {
  value: string;
  label?: string;
  variant?: ButtonProps["variant"];
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      toast.error("Couldn't copy. Please copy it manually.");
      return;
    }
    setCopied(true);
    toast.success("Copied to clipboard");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button type="button" variant={variant} size="icon" aria-label={label} onClick={copy}>
          {copied ? <Check /> : <Copy />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{copied ? "Copied" : label}</TooltipContent>
    </Tooltip>
  );
}
