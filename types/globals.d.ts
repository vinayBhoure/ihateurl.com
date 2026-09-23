export {};

/** Custom roles this app recognizes. Extend as needed. */
export type Roles = "admin" | "moderator";

// Requires the Sessions -> Customize session token claim in the Clerk
// Dashboard to include: { "metadata": "{{user.public_metadata}}" }
// See README.md -> "Adding role-based access" for the full setup.
declare global {
  interface CustomJwtSessionClaims {
    metadata?: {
      role?: Roles;
    };
  }
}
