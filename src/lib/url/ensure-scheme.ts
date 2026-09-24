const HAS_SCHEME = /^[a-z][a-z\d+.-]*:\/\//i;

/**
 * FD4: input typed without `scheme://` gets `https://`. Any other scheme passes through
 * unchanged so the server can reject it (only http/https are saved).
 */
export function ensureScheme(input: string): string {
  const value = input.trim();
  if (value === "" || HAS_SCHEME.test(value)) return value;
  return `https://${value}`;
}
