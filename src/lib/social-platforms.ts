/** Plan 7 §2.1: the one list of social platforms, shared by the settings form, the action and the profile page. */
export const SOCIAL_PLATFORMS = [
  "YOUTUBE",
  "INSTAGRAM",
  "X",
  "GITHUB",
  "LINKEDIN",
  "WEBSITE",
  "OTHER",
] as const;
export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

/** Settings shows these as fixed rows: a URL prefix + a handle. */
export const HANDLE_PLATFORMS = ["YOUTUBE", "INSTAGRAM", "X", "GITHUB", "LINKEDIN"] as const;
export type HandlePlatform = (typeof HANDLE_PLATFORMS)[number];

/** Settings adds these as extra rows holding a full URL. */
export const URL_PLATFORMS = ["WEBSITE", "OTHER"] as const;
export type UrlPlatform = (typeof URL_PLATFORMS)[number];

export const EXTRA_LINKS_MAX = 3;
export const SOCIAL_LINKS_MAX = HANDLE_PLATFORMS.length + EXTRA_LINKS_MAX;
export const SOCIAL_URL_MAX_LENGTH = 200;

type HandleConfig = {
  kind: "handle";
  label: string;
  /** Used in "{name} on {longLabel}" (Q4: X (Twitter)). */
  longLabel: string;
  /** Shown before the input, e.g. `github.com/`. */
  prefix: string;
  /** Pasted URLs starting with one of these (after scheme and `www.`/`m.`) are cut down to the handle. */
  pastePrefixes: string[];
  pattern: RegExp;
  rule: string;
  max: 1;
};

type UrlConfig = { kind: "url"; label: string; longLabel: string; max: number };

export const SOCIAL_PLATFORM_CONFIG: Record<HandlePlatform, HandleConfig> &
  Record<UrlPlatform, UrlConfig> = {
  YOUTUBE: {
    kind: "handle",
    label: "YouTube",
    longLabel: "YouTube",
    prefix: "youtube.com/@",
    pastePrefixes: ["youtube.com/@"],
    pattern: /^[A-Za-z0-9._-]{3,30}$/,
    rule: "Use 3–30 letters, numbers, ., _ or -.",
    max: 1,
  },
  INSTAGRAM: {
    kind: "handle",
    label: "Instagram",
    longLabel: "Instagram",
    prefix: "instagram.com/",
    pastePrefixes: ["instagram.com/"],
    pattern: /^[A-Za-z0-9._]{1,30}$/,
    rule: "Use up to 30 letters, numbers, . or _.",
    max: 1,
  },
  X: {
    kind: "handle",
    label: "X",
    longLabel: "X (Twitter)",
    prefix: "x.com/",
    pastePrefixes: ["x.com/", "twitter.com/"],
    pattern: /^[A-Za-z0-9_]{1,15}$/,
    rule: "Use up to 15 letters, numbers or _.",
    max: 1,
  },
  GITHUB: {
    kind: "handle",
    label: "GitHub",
    longLabel: "GitHub",
    prefix: "github.com/",
    pastePrefixes: ["github.com/"],
    pattern: /^(?!-)[A-Za-z0-9-]{1,39}$/,
    rule: "Use up to 39 letters, numbers or -, not starting with -.",
    max: 1,
  },
  LINKEDIN: {
    kind: "handle",
    label: "LinkedIn",
    longLabel: "LinkedIn",
    prefix: "linkedin.com/in/",
    pastePrefixes: ["linkedin.com/in/"],
    pattern: /^[A-Za-z0-9-]{3,100}$/,
    rule: "Use 3–100 letters, numbers or -.",
    max: 1,
  },
  WEBSITE: { kind: "url", label: "Website", longLabel: "Website", max: 1 },
  OTHER: { kind: "url", label: "Other", longLabel: "Other", max: EXTRA_LINKS_MAX },
};

export function isHandlePlatform(platform: SocialPlatform): platform is HandlePlatform {
  return SOCIAL_PLATFORM_CONFIG[platform].kind === "handle";
}

/** Trims, cuts a pasted profile URL down to its handle, then drops a leading `@`. */
export function normalizeHandle(platform: HandlePlatform, input: string): string {
  let value = input.trim();
  const bare = value.replace(/^https?:\/\//i, "").replace(/^(www|m|mobile)\./i, "");
  const prefix = SOCIAL_PLATFORM_CONFIG[platform].pastePrefixes.find((p) =>
    bare.toLowerCase().startsWith(p)
  );
  if (prefix) {
    value = bare.slice(prefix.length).replace(/[?#].*$/, "").replace(/\/+$/, "");
  }
  return value.replace(/^@/, "");
}

/** Trimmed value as stored: a handle for handle platforms, the URL as typed for the others. */
export function normalizeSocialValue(platform: SocialPlatform, input: string): string {
  return isHandlePlatform(platform) ? normalizeHandle(platform, input) : input.trim();
}

/** Error message for a non-empty normalized value, or `null` when it is valid. */
export function socialValueError(platform: SocialPlatform, value: string): string | null {
  if (isHandlePlatform(platform)) {
    const { pattern, rule } = SOCIAL_PLATFORM_CONFIG[platform];
    return pattern.test(value) ? null : rule;
  }
  if (value.length > SOCIAL_URL_MAX_LENGTH) {
    return `Links must be ${SOCIAL_URL_MAX_LENGTH} characters or fewer.`;
  }
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return "Enter a full https:// link.";
  }
  if (url.protocol !== "https:") return "Use an https:// link.";
  if (!url.hostname || url.username || url.password) return "Enter a full https:// link.";
  return null;
}

/** The link a stored value points to. Profile links are always built here, never from raw input. */
export function buildUrl(platform: SocialPlatform, value: string): string {
  const config = SOCIAL_PLATFORM_CONFIG[platform];
  return config.kind === "handle" ? `https://${config.prefix}${value}` : value;
}
