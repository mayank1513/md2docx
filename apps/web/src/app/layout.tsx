import { RootProvider } from "fumadocs-ui/provider/next";
import type { Metadata } from "next";
import "./global.css";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
});

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
  ? process.env.NEXT_PUBLIC_SITE_URL.startsWith("http")
    ? process.env.NEXT_PUBLIC_SITE_URL
    : `https://${process.env.NEXT_PUBLIC_SITE_URL}`
  : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://md2docx.js.org";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    template: "%s | Md2Docx",
    default: "Md2Docx - Universal Markdown to Word Engine",
  },
  description:
    "Convert standard Markdown, GFM tables, math equations, and diagrams into native Microsoft Word (.docx) documents with client privacy or server streaming.",
  keywords: [
    "markdown",
    "docx",
    "mdast",
    "unified",
    "remark",
    "word",
    "office",
    "omml",
    "latex",
    "mermaid",
    "document generation",
    "openxml",
  ],
  alternates: {
    canonical: "./",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName: "Md2Docx",
    locale: "en_US",
    url: baseUrl,
    title: "Md2Docx - Universal Markdown to Word Engine",
    description:
      "Convert standard Markdown, GFM tables, math equations, and diagrams into native Microsoft Word (.docx) documents with client privacy or server streaming.",
    images: [
      {
        url: "https://repository-images.githubusercontent.com/1405696656/b1920a9f-dda5-4809-844c-326e46b6485e",
        width: 1280,
        height: 640,
        alt: "Md2Docx - Universal Markdown to Word Engine",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Md2Docx - Universal Markdown to Word Engine",
    description:
      "Convert standard Markdown, GFM tables, math equations, and diagrams into native Microsoft Word (.docx) documents with client privacy or server streaming.",
    images: [
      "https://repository-images.githubusercontent.com/1405696656/b1920a9f-dda5-4809-844c-326e46b6485e",
    ],
    creator: "@mayank_chdhri",
  },
};

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
