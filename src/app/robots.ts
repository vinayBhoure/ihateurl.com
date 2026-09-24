import type { MetadataRoute } from "next";
import { env } from "@/config/env";

/**
 * §5.4. Exact (`$`) and trailing-slash patterns instead of bare prefixes, so a profile such as
 * `/apple` or `/logins` isn't caught by `/app` or `/login`.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/app$", "/app/", "/login$", "/login/", "/signup$", "/signup/", "/api/"],
    },
    sitemap: `${env.appUrl}/sitemap.xml`,
  };
}
