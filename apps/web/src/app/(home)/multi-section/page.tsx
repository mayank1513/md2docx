import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { MultiSectionDemo } from "@/components/multi-section-demo";

export const metadata: Metadata = {
  title: "Multi-Section AST Compilation Demo",
  description:
    "Interactive demonstration compiling multiple discrete Markdown AST trees into a native Microsoft Word (.docx) document with per-section page layouts (Portrait and Landscape) and shared reference scoping.",
  openGraph: {
    title: "Multi-Section AST Compilation Demo | Md2Docx",
    description:
      "Interactive demonstration compiling multiple discrete Markdown AST trees into a native Microsoft Word (.docx) document with per-section page layouts (Portrait and Landscape) and shared reference scoping.",
  },
};

export default function MultiSectionPage() {
  return (
    <main className="flex flex-col flex-1 w-full bg-background text-foreground antialiased selection:bg-primary/30">
      <div className="pt-12 pb-6 px-4 text-center border-b border-border/40 bg-muted/10">
        <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary mb-3">
          ⚡ Core Engine Feature
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground mb-3">
          Multi-Section AST Compilation
        </h1>
        <p className="max-w-2xl mx-auto text-sm md:text-base text-muted-foreground leading-relaxed">
          Compile multiple independent Markdown AST trees into a single Word
          (.docx) document. Switch between Portrait and Landscape layouts,
          offset footnotes automatically, and resolve cross-section reference
          links.
        </p>
      </div>

      <MultiSectionDemo />

      <Footer />
    </main>
  );
}
