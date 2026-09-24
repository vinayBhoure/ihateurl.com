"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const subscribe = () => () => {};

/** FD2 theme choice. The stored theme is only known in the browser, so the select renders after mount. */
export function AppearanceSelect() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);

  return (
    <div className="grid max-w-xs gap-2">
      <Label htmlFor="theme">Theme</Label>
      {mounted ? (
        <Select value={theme} onValueChange={setTheme}>
          <SelectTrigger id="theme" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
      ) : (
        <Skeleton className="h-11 w-full md:h-9" />
      )}
    </div>
  );
}
