"use client";

import { UserButton } from "@clerk/nextjs";
import { Globe2, Settings } from "lucide-react";

/**
 * C2.4: custom UserButton links. Clerk requires MenuItems/Link to be built inside a
 * client component, so the two server headers (app-header, public-header) delegate here.
 */
export function UserMenu({ username }: { username?: string }) {
  return (
    <UserButton>
      <UserButton.MenuItems>
        {username && <UserButton.Link label="My public page" labelIcon={<Globe2 />} href={`/u/${username}`} />}
        <UserButton.Link label="Settings" labelIcon={<Settings />} href="/app/settings" />
      </UserButton.MenuItems>
    </UserButton>
  );
}
