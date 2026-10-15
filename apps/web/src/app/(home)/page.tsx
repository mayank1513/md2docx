import type { Metadata } from "next";
import { DocxDemo } from "../../components/docx-demo";
import { Footer } from "../../components/footer";
import { Hero } from "../../components/hero";
import { PackageGrid } from "../../components/package-grid";

export const metadata: Metadata = {
  title: "md2docx - Markdown to DOCX Engine",
  description:
    "Convert Markdown Abstract Syntax Trees (MDAST) into Microsoft Word (.docx) documents with ease.",
  openGraph: {
    title: "md2docx - Markdown to DOCX Engine",
    description:
      "Convert Markdown Abstract Syntax Trees (MDAST) into Microsoft Word (.docx) documents with ease.",
  },
};

export default function HomePage() {
  return (
    <main className="flex flex-col flex-1 w-full bg-background text-foreground antialiased selection:bg-primary/30">
      <Hero />
      <DocxDemo />
      <PackageGrid />
      <Footer />
    </main>
  );
}
