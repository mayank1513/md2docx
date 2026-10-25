"use client";

import { parseFrontmatter } from "@m2d/frontmatter";
import {
  AlignLeft,
  BookOpen,
  FileText,
  KeyRound,
  LayoutTemplate,
  PlusCircle,
  Tag,
  User,
} from "lucide-react";
import { useMemo } from "react";

interface MetadataInspectorProps {
  markdown: string;
  coverPage?: boolean;
  infoBox?: boolean;
  onToggleCoverPage?: () => void;
  onToggleInfoBox?: () => void;
  onInsertFrontmatter: () => void;
}

export const MetadataInspector = ({
  markdown,
  coverPage = false,
  infoBox = true,
  onToggleCoverPage,
  onToggleInfoBox,
  onInsertFrontmatter,
}: MetadataInspectorProps) => {
  const metadata = useMemo(() => {
    const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!match) return null;

    try {
      return parseFrontmatter(match[1], "yaml");
    } catch {
      return null;
    }
  }, [markdown]);

  if (!metadata || Object.keys(metadata).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border rounded-xl bg-card/40 my-2">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
          <FileText className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-foreground">
          No YAML Frontmatter Detected
        </h3>
        <p className="text-xs text-muted-foreground max-w-md mt-1.5 mb-6 leading-relaxed">
          Frontmatter at the top of your Markdown document is automatically
          extracted and written into authentic Microsoft Word metadata
          properties and custom header / footer sections.
        </p>
        <button
          type="button"
          onClick={onInsertFrontmatter}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Insert Sample Frontmatter</span>
        </button>
      </div>
    );
  }

  const properties = [
    {
      label: "Document Title",
      value: metadata.title,
      target: "docxProps.title",
      icon: BookOpen,
      desc: "OpenXML Core Properties (core.xml)",
    },
    {
      label: "Author / Creator",
      value: metadata.author || metadata.creator,
      target: "docxProps.creator",
      icon: User,
      desc: "Document author in Word file properties",
    },
    {
      label: "Subject",
      value: metadata.subject,
      target: "docxProps.subject",
      icon: Tag,
      desc: "Subject metadata classification",
    },
    {
      label: "Keywords & Tags",
      value: Array.isArray(metadata.keywords)
        ? metadata.keywords.join(", ")
        : metadata.keywords ||
          (Array.isArray(metadata.tags)
            ? metadata.tags.join(", ")
            : metadata.tags),
      target: "docxProps.keywords",
      icon: KeyRound,
      desc: "Searchable indexing tags in Windows/Word",
    },
    {
      label: "Header Markdown",
      value: metadata.header,
      target: "sectionProps.headers.default",
      icon: LayoutTemplate,
      desc: "Native Word OpenXML section header element",
    },
    {
      label: "Footer Markdown",
      value: metadata.footer,
      target: "sectionProps.footers.default",
      icon: LayoutTemplate,
      desc: "Native Word OpenXML section footer element",
    },
    {
      label: "Description / Abstract",
      value: metadata.description,
      target: "docxProps.description",
      icon: AlignLeft,
      desc: "Document executive summary / remarks",
    },
  ].filter((p) => p.value !== undefined && p.value !== "");

  return (
    <div className="space-y-4 my-2">
      {/* Overview Banner */}
      <div className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 text-xs text-foreground flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>
            Active Frontmatter:{" "}
            <strong>{properties.length} mapped document properties</strong>
          </span>
        </div>
        <span className="font-mono text-[11px] text-muted-foreground">
          @m2d/frontmatter • Live AST Sync
        </span>
      </div>

      {/* Interactive Layout Synthesis Controls */}
      <div className="p-3.5 rounded-xl border border-border bg-card/60 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground mb-0.5">
            <LayoutTemplate className="w-4 h-4 text-primary" />
            <span>Automated Layout Synthesis</span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Configure how frontmatter is transformed into Word document
            sections.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleCoverPage}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
              coverPage
                ? "bg-primary text-primary-foreground border-primary shadow-xs font-semibold"
                : "bg-muted/40 border-border/70 text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>Cover Page {coverPage ? "✓" : ""}</span>
          </button>
          <button
            type="button"
            onClick={onToggleInfoBox}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
              infoBox
                ? "bg-primary text-primary-foreground border-primary shadow-xs font-semibold"
                : "bg-muted/40 border-border/70 text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>Info-Box Callout {infoBox ? "✓" : ""}</span>
          </button>
        </div>
      </div>

      {/* Property Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {properties.map((prop) => {
          const Icon = prop.icon;
          return (
            <div
              key={prop.label}
              className="p-3.5 rounded-xl border border-border bg-card/60 flex flex-col justify-between hover:border-primary/30 transition-colors shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <Icon className="w-3.5 h-3.5 text-primary" />
                    <span>{prop.label}</span>
                  </div>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                    {prop.target}
                  </span>
                </div>
                <div className="text-xs font-medium text-foreground bg-muted/30 p-2 rounded-lg break-words leading-relaxed">
                  {String(prop.value)}
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">
                {prop.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Raw Frontmatter JSON View */}
      <div className="p-3.5 rounded-xl border border-border bg-muted/30 text-xs">
        <span className="font-mono text-[11px] font-semibold text-muted-foreground mb-1.5 block">
          Parsed AST Object:
        </span>
        <pre className="font-mono text-[11px] text-foreground overflow-x-auto p-2 bg-background/60 rounded-lg border border-border/50">
          {JSON.stringify(metadata, null, 2)}
        </pre>
      </div>
    </div>
  );
};
