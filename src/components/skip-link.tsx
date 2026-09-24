/** First focusable element on the page; jumps to `<main id="main">`. */
export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only rounded-md bg-background text-sm font-medium focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:border focus:px-4 focus:py-2"
    >
      Skip to content
    </a>
  );
}
