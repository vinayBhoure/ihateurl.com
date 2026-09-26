"use client";

import { useEffect } from "react";

const SRC = "https://user.userbadge.cc/badge.js";
const SITE_ID = "s_10761f0fd2";

type BadgeWindow = Window & { UserBadge?: { destroy?: () => void } };

const destroyBadge = () => (window as BadgeWindow).UserBadge?.destroy?.();

/**
 * UserBadge visitor counter (owner request, 2026-09-26): a fixed floating pill on the home page only
 * (owner, 2026-09-27), disclosed in the Privacy Notice. The script pins itself to <body> and would
 * outlive a client-side navigation, so it is added on mount and destroyed on unmount, which also
 * closes its live connection. Each fresh script run boots a new widget.
 */
export function UserBadge() {
  useEffect(() => {
    let script: HTMLScriptElement | undefined;
    let left = false;
    // Deferred so React's dev double mount inserts the script once.
    const timer = setTimeout(() => {
      script = document.createElement("script");
      script.src = SRC;
      script.async = true;
      script.dataset.siteId = SITE_ID;
      // Left before the script ran: it still executes, so undo it right away.
      script.addEventListener("load", () => left && destroyBadge());
      document.body.appendChild(script);
    }, 0);

    return () => {
      left = true;
      clearTimeout(timer);
      destroyBadge();
      script?.remove();
    };
  }, []);

  return null;
}
