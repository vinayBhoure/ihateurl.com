import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type PrefixedInputProps = Omit<React.ComponentProps<"input">, "prefix"> & {
  /** Fixed text shown before the value, e.g. `github.com/`. */
  prefix: string;
};

/**
 * Input with a fixed mono prefix; same look as the username field in `ProfileForm`.
 * Pass `aria-describedby` for errors or a preview; the prefix itself is decorative.
 */
export const PrefixedInput = React.forwardRef<HTMLInputElement, PrefixedInputProps>(
  ({ prefix, className, ...props }, ref) => (
    <div className="flex h-11 min-w-0 items-center rounded-md border border-input focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background md:h-9">
      <span aria-hidden className="shrink-0 pl-3 font-mono text-sm text-muted-foreground">
        {prefix}
      </span>
      <Input
        ref={ref}
        autoComplete="off"
        autoCapitalize="none"
        spellCheck={false}
        className={cn(
          "h-full min-w-0 border-0 pl-0 font-mono focus-visible:ring-0 focus-visible:ring-offset-0",
          className
        )}
        {...props}
      />
    </div>
  )
);
PrefixedInput.displayName = "PrefixedInput";
