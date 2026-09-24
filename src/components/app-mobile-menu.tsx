"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { AppNav } from "@/components/app-nav";
import { AppSearchForm } from "@/components/app-search-form";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

/** Below 768 px the header nav and search move into this sheet. */
export function AppMobileMenu() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Menu" className="md:hidden">
              <Menu />
            </Button>
          </SheetTrigger>
        </TooltipTrigger>
        <TooltipContent>Menu</TooltipContent>
      </Tooltip>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription className="sr-only">App sections and search</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 px-4">
          <AppSearchForm onSubmit={close} />
          <AppNav orientation="vertical" onNavigate={close} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
