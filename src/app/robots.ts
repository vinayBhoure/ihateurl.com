import type { MetadataRoute } from "next";
import { env } from "@/config/env";

/**
 * §5.4. Profiles and collections live under `/u/`, so plain prefixes are safe here —
 * no username can collide with `/app`, `/login` or `/signup` the way a bare `/{username}` could.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/app", "/login", "/signup", "/api"],
    },
    sitemap: `${env.appUrl}/sitemap.xml`,
  };
}
