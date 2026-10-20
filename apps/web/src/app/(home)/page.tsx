import type { Metadata } from "next";
import { ComparisonMatrix } from "../../components/comparison-matrix";
import { CoreFeatures } from "../../components/core-features";
import { DocxDemo } from "../../components/docx-demo";
import { Footer } from "../../components/footer";
import { Hero } from "../../components/hero";
import { PackageGrid } from "../../components/package-grid";

export const metadata: Metadata = {
  title: "Md2Docx — Universal Markdown to Word Engine",
  description:
    "Convert standard Markdown, GFM tables, math equations, and diagrams into native Microsoft Word (.docx) documents with client privacy or server streaming.",
  openGraph: {
    title: "Md2Docx — Universal Markdown to Word Engine",
    description:
      "Convert standard Markdown, GFM tables, math equations, and diagrams into native Microsoft Word (.docx) documents with client privacy or server streaming.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://md2docx.js.org/#website",
      url: "https://md2docx.js.org",
      name: "Md2Docx",
      description:
        "Universal Markdown to Word (.docx) document engine for Node.js and modern browsers.",
      publisher: {
        "@type": "Person",
        name: "Mayank Kumar Chaudhari",
        url: "https://github.com/mayank1513",
      },
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://md2docx.js.org/#software",
      name: "Md2Docx",
      alternateName: ["mdast2docx", "@m2d/core"],
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Cross-platform (Node.js, Browser)",
      url: "https://md2docx.js.org",
      description:
        "Convert standard Markdown, GFM tables, math equations, and diagrams into native Microsoft Word (.docx) documents with client privacy or server streaming.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      license: "https://opensource.org/licenses/MIT",
      author: {
        "@type": "Person",
        name: "Mayank Kumar Chaudhari",
        url: "https://github.com/mayank1513",
      },
      codeRepository: "https://github.com/md2docx/md2docx",
      sameAs: [
        "https://github.com/md2docx/md2docx",
        "https://www.npmjs.com/package/mdast2docx",
      ],
    },
  ],
};

export default function HomePage() {
  return (
    <main className="flex flex-col flex-1 w-full bg-background text-foreground antialiased selection:bg-primary/30">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <Hero />
      <DocxDemo />
      <CoreFeatures />
      <ComparisonMatrix />
      <PackageGrid />
      <Footer />
    </main>
  );
}
