import fs from "node:fs";
import path from "node:path";
import * as LucideIcons from "lucide-react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

interface PackageMeta {
  title: string;
  description?: string;
  tagLine?: string;
  icon?: string;
}

const DEFAULT_PACKAGES: { pkgId: string; meta: PackageMeta }[] = [
  {
    pkgId: "mdast2docx",
    meta: {
      title: "mdast2docx",
      tagLine:
        "Complete all-in-one distribution bundle with all official plugins.",
      icon: "Package",
    },
  },
  {
    pkgId: "core",
    meta: {
      title: "@m2d/core",
      tagLine:
        "Core AST-to-OpenXML compiler, plugin pipeline, and caching layer.",
      icon: "Cpu",
    },
  },
  {
    pkgId: "table",
    meta: {
      title: "@m2d/table",
      tagLine:
        "Rich GFM tables with borders, repeating headers, and cell shading.",
      icon: "Table",
    },
  },
  {
    pkgId: "list",
    meta: {
      title: "@m2d/list",
      tagLine:
        "Hierarchical decimal numbering (1.1.1) and nested bullet glyphs.",
      icon: "ListOrdered",
    },
  },
  {
    pkgId: "math",
    meta: {
      title: "@m2d/math",
      tagLine:
        "LaTeX math translated directly into native editable Word MathML.",
      icon: "Calculator",
    },
  },
  {
    pkgId: "mermaid",
    meta: {
      title: "@m2d/mermaid",
      tagLine:
        "Browser Mermaid diagrams with self-healing syntax error repair.",
      icon: "GitBranch",
    },
  },
  {
    pkgId: "mermaid-node",
    meta: {
      title: "@m2d/mermaid-node",
      tagLine:
        "Server-side headless Mermaid rendering with zero browser dependencies.",
      icon: "Server",
    },
  },
  {
    pkgId: "image",
    meta: {
      title: "@m2d/image",
      tagLine:
        "Client-side image and SVG rasterization with persistent IndexedDB caching.",
      icon: "Image",
    },
  },
  {
    pkgId: "image-node",
    meta: {
      title: "@m2d/image-node",
      tagLine:
        "Server-side image rasterizer powered by sharp with code block fallbacks.",
      icon: "FileImage",
    },
  },
  {
    pkgId: "html",
    meta: {
      title: "@m2d/html",
      tagLine:
        "Converts raw embedded HTML tags and inline CSS styles into semantic MDAST.",
      icon: "Globe",
    },
  },
  {
    pkgId: "remark-docx",
    meta: {
      title: "@m2d/remark-docx",
      tagLine:
        "Official Unified/Remark compiler plugin for direct DOCX output.",
      icon: "FileText",
    },
  },
  {
    pkgId: "react-markdown",
    meta: {
      title: "@m2d/react-markdown",
      tagLine:
        "SSR-friendly React renderer that retains AST for instant Word export.",
      icon: "Layers",
    },
  },
];

export const PackageGrid = async () => {
  const docsDir = path.join(process.cwd(), "content/docs");
  const packages: { pkgId: string; meta: PackageMeta }[] = [];

  if (fs.existsSync(docsDir)) {
    try {
      const folders = fs.readdirSync(docsDir, { withFileTypes: true });

      for (const folder of folders) {
        if (folder.isDirectory()) {
          const metaPath = path.join(docsDir, folder.name, "meta.json");
          if (fs.existsSync(metaPath)) {
            const content = fs.readFileSync(metaPath, "utf8");
            try {
              const meta = JSON.parse(content);
              packages.push({
                pkgId: folder.name,
                meta,
              });
            } catch {
              console.error(`Failed to parse meta.json in ${folder.name}`);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error reading docs directory:", error);
    }
  }

  const displayPackages = packages.length > 0 ? packages : DEFAULT_PACKAGES;

  // Sort by title alphabetically
  displayPackages.sort((a, b) =>
    (a.meta.title || "").localeCompare(b.meta.title || ""),
  );

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-4">
            Monorepo Architecture
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 text-foreground">
            The Md2Docx Modular Ecosystem
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Choose the all-in-one umbrella distribution or cherry-pick
            lightweight scoped packages for microservices and edge runtimes.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayPackages.map(({ pkgId, meta }) => {
            const IconName = meta.icon || "Box";
            const IconComponent =
              // @ts-expect-error -- dynamic lucide icon
              // biome-ignore lint/performance/noDynamicNamespaceImportAccess: dynamic icon lookup
              (LucideIcons[IconName] as React.ElementType) || LucideIcons.Box;

            return (
              <Link
                key={pkgId}
                href={`/docs/${pkgId}`}
                className="group block focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent rounded-2xl"
              >
                <Card className="h-full border-border/50 bg-card transition-all duration-300 hover:border-primary/40 hover:shadow-lg group-hover:-translate-y-1 rounded-2xl">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">
                      {meta.title || pkgId}
                    </CardTitle>
                    <CardDescription className="text-sm mt-2 line-clamp-2 leading-relaxed">
                      {meta.tagLine ||
                        meta.description ||
                        "Explore documentation and guides."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm font-semibold text-primary group-hover:text-primary transition-colors">
                      Explore Package
                      <ArrowRight className="w-4 h-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};
