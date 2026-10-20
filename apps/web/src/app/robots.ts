import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://md2docx.js.org";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/docx"],
      },
      {
        // Explicitly welcome AI and Answer Engine search crawlers
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "ClaudeBot",
          "PerplexityBot",
          "Google-Extended",
          "Applebot-Extended",
          "cohere-ai",
        ],
        allow: ["/", "/llms.txt", "/llms-full.txt", "/docs/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
