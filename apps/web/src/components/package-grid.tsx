"use client";

import {
  ArrowRight,
  Calculator,
  Code,
  Cpu,
  Database,
  FileCheck,
  FileCode,
  FileDown,
  FileImage,
  FileText,
  GitBranch,
  Globe,
  Globe2,
  Image as ImageIcon,
  Layers,
  LibraryBig,
  ListOrdered,
  Package,
  Search,
  Server,
  Sparkles,
  Table,
  Terminal,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "./ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

type CategoryId =
  | "all"
  | "entry"
  | "frameworks"
  | "compilers"
  | "plugins"
  | "core";
type RuntimeType = "universal" | "browser" | "node";

interface PackageDefinition {
  pkgId: string;
  title: string;
  tagLine: string;
  icon: React.ElementType;
  category: CategoryId;
  runtime: RuntimeType;
  featured?: boolean;
}

const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: "all", label: "All Packages" },
  { id: "entry", label: "Entry Points & CLI" },
  { id: "frameworks", label: "Frameworks & Editors" },
  { id: "compilers", label: "Unified Compilers" },
  { id: "plugins", label: "Syntax & Plugins" },
  { id: "core", label: "Core & Engine" },
];

const PACKAGES: PackageDefinition[] = [
  // 1. Entry Points & CLI
  {
    pkgId: "md2docx",
    title: "@m2d/md2docx",
    tagLine:
      "All-in-one batteries-included Markdown to DOCX converter with zero configuration.",
    icon: LibraryBig,
    category: "entry",
    runtime: "universal",
    featured: true,
  },
  {
    pkgId: "cli",
    title: "@m2d/cli",
    tagLine:
      "Zero-config terminal CLI and headless batch document generation engine.",
    icon: Terminal,
    category: "entry",
    runtime: "node",
    featured: true,
  },
  {
    pkgId: "mdast2docx",
    title: "mdast2docx",
    tagLine:
      "Complete all-in-one distribution bundle pre-wired with all official plugins.",
    icon: Package,
    category: "entry",
    runtime: "universal",
  },

  // 2. Frameworks & Editors
  {
    pkgId: "tiptap",
    title: "@m2d/tiptap",
    tagLine:
      "Client-side DOCX export extension for Tiptap 3 / ProseMirror with frontmatter preservation.",
    icon: FileDown,
    category: "frameworks",
    runtime: "browser",
    featured: true,
  },
  {
    pkgId: "react-markdown",
    title: "@m2d/react-markdown",
    tagLine:
      "SSR-friendly React Markdown renderer that captures AST for instant Word export.",
    icon: Layers,
    category: "frameworks",
    runtime: "universal",
  },

  // 3. Unified / Remark Pipeline Compilers
  {
    pkgId: "remark-docx",
    title: "@m2d/remark-docx",
    tagLine:
      "Official Unified/Remark compiler plugin for direct in-browser DOCX generation.",
    icon: FileText,
    category: "compilers",
    runtime: "browser",
    featured: true,
  },
  {
    pkgId: "remark-docx-node",
    title: "@m2d/remark-docx-node",
    tagLine:
      "Server-side Remark compiler plugin with native Sharp and beautiful-mermaid rasterization.",
    icon: FileCheck,
    category: "compilers",
    runtime: "node",
  },

  // 4. Official Syntax & Content Plugins
  {
    pkgId: "frontmatter",
    title: "@m2d/frontmatter",
    tagLine:
      "Parses YAML/TOML front-matter metadata into docxProps, cover pages, and info-boxes.",
    icon: FileCode,
    category: "plugins",
    runtime: "universal",
  },
  {
    pkgId: "table",
    title: "@m2d/table",
    tagLine:
      "Rich GFM tables with custom borders, cell padding, repeating headers, and background shading.",
    icon: Table,
    category: "plugins",
    runtime: "universal",
  },
  {
    pkgId: "math",
    title: "@m2d/math",
    tagLine:
      "LaTeX math equations translated directly into native editable Word OMML MathML.",
    icon: Calculator,
    category: "plugins",
    runtime: "universal",
  },
  {
    pkgId: "mermaid",
    title: "@m2d/mermaid",
    tagLine:
      "Browser Mermaid diagrams with SVG extraction and self-healing syntax error repair.",
    icon: GitBranch,
    category: "plugins",
    runtime: "browser",
  },
  {
    pkgId: "mermaid-node",
    title: "@m2d/mermaid-node",
    tagLine:
      "Headless server-side Mermaid renderer powered by beautiful-mermaid with zero browser dependencies.",
    icon: Server,
    category: "plugins",
    runtime: "node",
  },
  {
    pkgId: "html",
    title: "@m2d/html",
    tagLine:
      "Converts HTML tags, inline CSS styles, and <style> block stylesheets into styled OpenXML nodes.",
    icon: Globe,
    category: "plugins",
    runtime: "browser",
  },
  {
    pkgId: "html-node",
    title: "@m2d/html-node",
    tagLine:
      "Lightweight server-side HTML parser powered by LinkeDOM without heavy JSDOM overhead.",
    icon: Globe2,
    category: "plugins",
    runtime: "node",
  },
  {
    pkgId: "image",
    title: "@m2d/image",
    tagLine:
      "Browser image rasterization with IndexedDB caching and collapsible code block fallbacks.",
    icon: ImageIcon,
    category: "plugins",
    runtime: "browser",
  },
  {
    pkgId: "image-node",
    title: "@m2d/image-node",
    tagLine:
      "Server-side image rasterizer powered by Sharp with authentic Word code block fallbacks.",
    icon: FileImage,
    category: "plugins",
    runtime: "node",
  },
  {
    pkgId: "list",
    title: "@m2d/list",
    tagLine:
      "Hierarchical decimal numbering (1.1.1) and custom nested bullet glyphs.",
    icon: ListOrdered,
    category: "plugins",
    runtime: "universal",
  },

  // 5. Core Engine & Foundation
  {
    pkgId: "core",
    title: "@m2d/core",
    tagLine:
      "Foundational AST-to-OpenXML compiler, plugin pipeline, and warnings deduplication.",
    icon: Cpu,
    category: "core",
    runtime: "universal",
  },
  {
    pkgId: "cache",
    title: "@m2d/cache",
    tagLine:
      "Persistent xxhash-wasm and IndexedDB caching engine for rasterized diagrams and assets.",
    icon: Database,
    category: "core",
    runtime: "universal",
  },
  {
    pkgId: "mdast",
    title: "@m2d/mdast",
    tagLine:
      "TypeScript types and schemas for extended MDAST OpenXML nodes and properties.",
    icon: Code,
    category: "core",
    runtime: "universal",
  },
];

const RUNTIME_BADGES: Record<
  RuntimeType,
  { label: string; className: string }
> = {
  universal: {
    label: "Universal",
    className:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  browser: {
    label: "Browser",
    className:
      "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  node: {
    label: "Node.js",
    className:
      "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  },
};

const CATEGORY_NAMES: Record<CategoryId, string> = {
  all: "Package",
  entry: "Quickstart Entry",
  frameworks: "Framework Extension",
  compilers: "Unified Compiler",
  plugins: "Content Plugin",
  core: "Core Engine",
};

export const PackageGrid = () => {
  const [activeCategory, setActiveCategory] = useState<CategoryId>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPackages = useMemo(() => {
    return PACKAGES.filter((pkg) => {
      const matchesCategory =
        activeCategory === "all" || pkg.category === activeCategory;
      const matchesQuery =
        !searchQuery.trim() ||
        pkg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pkg.tagLine.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pkg.pkgId.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, searchQuery]);

  // Handle smooth scroll when navigating to #ecosystem or when URL contains #ecosystem / #modular-ecosystem
  useEffect(() => {
    if (typeof window === "undefined") return;

    const scrollToHash = () => {
      const hash = window.location.hash.replace(/^#/, "");
      if (hash === "ecosystem" || hash === "modular-ecosystem") {
        const el =
          document.getElementById(hash) || document.getElementById("ecosystem");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    };

    if (window.location.hash) {
      const timer = setTimeout(scrollToHash, 100);
      return () => clearTimeout(timer);
    }

    window.addEventListener("hashchange", scrollToHash);
    return () => window.removeEventListener("hashchange", scrollToHash);
  }, []);

  return (
    <section
      id="ecosystem"
      className="py-24 bg-background border-t border-border/40 scroll-mt-16 md:scroll-mt-20 relative"
    >
      <div id="modular-ecosystem" className="absolute -top-20" />
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-4 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            20 Purpose-Built Packages
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 text-foreground">
            The Md2Docx Modular Ecosystem
          </h2>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto leading-relaxed">
            Organized into clear architectural layers — start with high-level
            batteries-included entry points, or cherry-pick lightweight scoped
            plugins for microservices and edge runtimes.
          </p>
        </div>

        {/* Filter Toolbar: Categories & Search */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10 pb-6 border-b border-border/60">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 justify-center md:justify-start w-full md:w-auto">
            {CATEGORIES.map((cat) => {
              const count =
                cat.id === "all"
                  ? PACKAGES.length
                  : PACKAGES.filter((p) => p.category === cat.id).length;
              const isActive = activeCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                    isActive
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-background text-muted-foreground"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Search */}
          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 20 packages..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-muted/40 border border-border/80 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            />
          </div>
        </div>

        {/* Package Cards Grid */}
        {filteredPackages.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm">
            No packages match your search filter "{searchQuery}".
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPackages.map((pkg) => {
              const IconComponent = pkg.icon;
              const runtimeInfo = RUNTIME_BADGES[pkg.runtime];

              return (
                <Link
                  key={pkg.pkgId}
                  href={`/docs/${pkg.pkgId}`}
                  className="group block focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent rounded-2xl"
                >
                  <Card
                    className={`h-full border bg-card transition-all duration-300 hover:border-primary/50 hover:shadow-xl group-hover:-translate-y-1 rounded-2xl flex flex-col justify-between ${
                      pkg.featured
                        ? "border-primary/30 ring-1 ring-primary/10 shadow-xs"
                        : "border-border/60"
                    }`}
                  >
                    <CardHeader className="pb-3">
                      {/* Top Badges: Category & Runtime */}
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <Badge
                          variant="outline"
                          className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 border-border/80 text-muted-foreground"
                        >
                          {CATEGORY_NAMES[pkg.category]}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-mono px-2 py-0.5 border ${runtimeInfo.className}`}
                        >
                          {runtimeInfo.label}
                        </Badge>
                      </div>

                      {/* Icon & Title */}
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300 shrink-0">
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <CardTitle className="text-base font-bold font-mono group-hover:text-primary transition-colors">
                          {pkg.title}
                        </CardTitle>
                      </div>

                      {/* TagLine */}
                      <CardDescription className="text-xs mt-2 line-clamp-3 leading-relaxed text-muted-foreground">
                        {pkg.tagLine}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="flex items-center text-xs font-semibold text-primary pt-3 border-t border-border/40 group-hover:text-primary transition-colors">
                        Explore Documentation
                        <ArrowRight className="w-3.5 h-3.5 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
