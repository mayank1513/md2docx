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
    : "https://promptshield.js.org";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    template: "%s | mdast2docx",
    default: "mdast2docx - Markdown to DOCX Converter",
  },
  description:
    "A powerful, modular, and extensible Markdown to DOCX converter for Node.js and browsers.",
  keywords: [
    "markdown",
    "docx",
    "mdast",
    "unified",
    "remark",
    "word",
    "office",
    "document generation",
  ],
  openGraph: {
    type: "website",
    siteName: "mdast2docx",
    locale: "en_US",
    title: "mdast2docx - Markdown to DOCX Converter",
    description:
      "A powerful, modular, and extensible Markdown to DOCX converter for Node.js and browsers.",
  },
  twitter: {
    card: "summary_large_image",
    title: "mdast2docx - Markdown to DOCX Converter",
    description:
      "A powerful, modular, and extensible Markdown to DOCX converter for Node.js and browsers.",
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
