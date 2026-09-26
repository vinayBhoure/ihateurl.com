/**
 * UserBadge visitor counter (owner request, 2026-09-26). Rendered on the home and Explore pages only
 * and disclosed in the Privacy Notice. React 19 hoists async scripts into <head> and loads them once.
 */
export function UserBadgeScript() {
  return <script src="https://user.userbadge.cc/badge.js" data-site-id="s_10761f0fd2" async />;
}
