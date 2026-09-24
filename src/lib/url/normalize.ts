export class InvalidUrlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidUrlError";
  }
}

const TRACKING_PARAMS = new Set(["fbclid", "gclid"]);

function isTrackingParam(key: string): boolean {
  const k = key.toLowerCase();
  return k.startsWith("utm_") || TRACKING_PARAMS.has(k);
}

function decodeKey(pair: string): string {
  const raw = pair.split("=")[0].replace(/\+/g, " ");
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

/**
 * D15: lowercase host, drop fragment and default port, strip trailing slash
 * (except root), remove utm_* / fbclid / gclid. http and https stay distinct.
 */
export function normalizeUrl(input: string): string {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    throw new InvalidUrlError("Enter a valid URL.");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new InvalidUrlError("Only http and https links are supported.");
  }
  if (url.username || url.password) {
    throw new InvalidUrlError("Links with a username or password are not allowed.");
  }
  if (!url.hostname) {
    throw new InvalidUrlError("Enter a valid URL.");
  }

  url.hash = "";

  // Filter the raw query so kept params keep their original encoding.
  const kept = url.search
    .slice(1)
    .split("&")
    .filter((pair) => pair !== "" && !isTrackingParam(decodeKey(pair)));
  url.search = kept.length > 0 ? `?${kept.join("&")}` : "";

  if (url.pathname !== "/") {
    url.pathname = url.pathname.replace(/\/+$/, "") || "/";
  }

  return url.toString();
}
