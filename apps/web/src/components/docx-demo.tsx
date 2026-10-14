"use client";

import { Download, FileText, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

export const DocxDemo = () => {
  const [loading, setLoading] = useState(false);
  const [customMd, setCustomMd] = useState(
    "# Hello md2docx!\n\nThis is a **live test document** converted directly to DOCX.\n\n- Real-time generation\n- OpenXML Word (.docx)\n- Powered by `@m2d/core`\n",
  );
  const [customLoading, setCustomLoading] = useState(false);

  const downloadSampleDocx = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/docx");
      if (!response.ok) throw new Error("Conversion failed");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "sample.docx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download DOCX:", err);
    } finally {
      setLoading(false);
    }
  };

  const downloadCustomDocx = async () => {
    setCustomLoading(true);
    try {
      const response = await fetch("/api/docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markdown: customMd }),
      });
      if (!response.ok) throw new Error("Conversion failed");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "custom-document.docx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download custom DOCX:", err);
    } finally {
      setCustomLoading(false);
    }
  };

  return (
    <section className="py-16 border-y border-border/40 bg-muted/20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary mb-3">
            <FileText className="w-3.5 h-3.5" />
            Live Conversion Demo
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Try Markdown to DOCX in Action
          </h2>
          <p className="text-muted-foreground mt-2 text-sm md:text-base">
            Download the comprehensive sample document or convert custom
            markdown on the fly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Card 1: Comprehensive Sample */}
          <div className="flex flex-col justify-between p-6 rounded-xl border border-border bg-card shadow-sm">
            <div>
              <h3 className="font-semibold text-lg text-foreground mb-2">
                Comprehensive Showcase
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                The full <code>sample.md</code> covering headings, nested lists,
                tables, GFM task lists, footnotes, math equations, and diagrams.
              </p>
            </div>
            <Button
              size="lg"
              onClick={downloadSampleDocx}
              disabled={loading}
              className="w-full mt-4 font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating .docx...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Download sample.docx
                </>
              )}
            </Button>
          </div>

          {/* Card 2: Interactive Playground */}
          <div className="flex flex-col justify-between p-6 rounded-xl border border-border bg-card shadow-sm">
            <div>
              <h3 className="font-semibold text-lg text-foreground mb-2">
                Custom Markdown
              </h3>
              <textarea
                value={customMd}
                onChange={(e) => setCustomMd(e.target.value)}
                rows={4}
                className="w-full p-2.5 text-xs font-mono rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                placeholder="Type your markdown here..."
              />
            </div>
            <Button
              variant="outline"
              size="lg"
              onClick={downloadCustomDocx}
              disabled={customLoading || !customMd.trim()}
              className="w-full mt-4 font-semibold"
            >
              {customLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Converting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Convert to DOCX
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
