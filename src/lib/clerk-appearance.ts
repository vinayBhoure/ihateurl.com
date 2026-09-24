/**
 * Clerk components (SignIn, SignUp, UserButton) read our design tokens (plan 2 §4.1),
 * so they follow Light / Dark with the rest of the app (risk R2).
 */
export const clerkAppearance = {
  variables: {
    colorPrimary: "var(--primary)",
    colorPrimaryForeground: "var(--primary-foreground)",
    colorDanger: "var(--destructive)",
    colorSuccess: "var(--success)",
    colorNeutral: "var(--foreground)",
    colorForeground: "var(--foreground)",
    colorMuted: "var(--muted)",
    colorMutedForeground: "var(--muted-foreground)",
    colorBackground: "var(--card)",
    colorInput: "var(--card)",
    colorInputForeground: "var(--foreground)",
    colorRing: "var(--ring)",
    fontFamily: "var(--font-geist-sans)",
    borderRadius: "0.5rem",
  },
};
