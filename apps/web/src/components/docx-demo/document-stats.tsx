"use client";

import {
  Calculator,
  FileSpreadsheet,
  FileText,
  GitBranch,
  Heading,
  Layers,
} from "lucide-react";
import { useMemo } from "react";

interface DocumentStatsProps {
  markdown: string;
}

export const DocumentStats = ({ markdown }: DocumentStatsProps) => {
  const stats = useMemo(() => {
    const textWithoutFrontmatter = markdown.replace(/^---[\s\S]*?---\s*/, "");

    const words = textWithoutFrontmatter
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0).length;

    const headings = (markdown.match(/^#{1,6}\s+/gm) ?? []).length;
    const mathCount = (markdown.match(/\$\$[\s\S]*?\$\$|\$[^$\n]+?\$/g) ?? [])
      .length;
    const mermaidCount = (markdown.match(/```mermaid/g) ?? []).length;

    // Approximate tables by table header divider |---|
    const tableCount = (markdown.match(/\|(?:\s*[:-]+[-| :]*)\|/g) ?? [])
      .length;
    const estimatedPages = Math.max(1, Math.ceil(words / 250));

    return {
      words,
      headings,
      mathCount,
      mermaidCount,
      tableCount,
      estimatedPages,
    };
  }, [markdown]);

  return (
    <div className="flex flex-wrap items-center justify-between gap-y-1.5 gap-x-4 px-5 py-2 bg-muted/20 border-b border-border/50 text-xs text-muted-foreground font-mono">
      <div className="flex items-center gap-1.5 text-foreground font-medium">
        <FileText className="w-3.5 h-3.5 text-primary" />
        <span>{stats.words.toLocaleString()} words</span>
        <span className="text-border">|</span>
        <span className="inline-flex items-center gap-1">
          <Layers className="w-3.5 h-3.5 text-muted-foreground" />~
          {stats.estimatedPages} page{stats.estimatedPages > 1 ? "s" : ""}
        </span>
      </div>

      <div className="flex items-center flex-wrap gap-x-3 gap-y-1">
        {stats.headings > 0 && (
          <span className="inline-flex items-center gap-1">
            <Heading className="w-3 h-3 text-sky-500" />
            {stats.headings} heading{stats.headings > 1 ? "s" : ""}
          </span>
        )}
        {stats.tableCount > 0 && (
          <span className="inline-flex items-center gap-1">
            <FileSpreadsheet className="w-3 h-3 text-emerald-500" />
            {stats.tableCount} table{stats.tableCount > 1 ? "s" : ""}
          </span>
        )}
        {stats.mathCount > 0 && (
          <span className="inline-flex items-center gap-1">
            <Calculator className="w-3 h-3 text-amber-500" />
            {stats.mathCount} formula{stats.mathCount > 1 ? "s" : ""}
          </span>
        )}
        {stats.mermaidCount > 0 && (
          <span className="inline-flex items-center gap-1">
            <GitBranch className="w-3 h-3 text-indigo-500" />
            {stats.mermaidCount} diagram{stats.mermaidCount > 1 ? "s" : ""}
          </span>
        )}
      </div>
    </div>
  );
};
