import type { MetadataRoute } from "next";
import { source } from "@/lib/source";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://md2docx.js.org";
  const pages = source.getPages();

  const docEntries: MetadataRoute.Sitemap = pages.map((page) => ({
    url: `${baseUrl}${page.url}`,
    lastModified: page.data.lastModified
      ? new Date(page.data.lastModified)
      : new Date(),
    changeFrequency: "monthly",
    priority: page.url === "/docs" || page.url === "/docs/overview" ? 0.9 : 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    ...docEntries,
  ];
}
