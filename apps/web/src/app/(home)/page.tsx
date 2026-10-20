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

export default function HomePage() {
  return (
    <main className="flex flex-col flex-1 w-full bg-background text-foreground antialiased selection:bg-primary/30">
      <Hero />
      <DocxDemo />
      <CoreFeatures />
      <ComparisonMatrix />
      <PackageGrid />
      <Footer />
    </main>
  );
}
