import { Check } from "lucide-react";

const matrix = [
  {
    feature: "Runs 100% in Browser",
    md2docx: "Yes (0ms network, full privacy)",
    pandoc: "No (native binary required)",
    docxJs: "Yes (client-side only)",
    htmlDocx: "Yes (limited DOM)",
  },
  {
    feature: "Markdown / MDAST First",
    md2docx: "Native AST parsing & transforms",
    pandoc: "Yes (internal AST)",
    docxJs: "Manual imperative code only",
    htmlDocx: "HTML parsing only",
  },
  {
    feature: "Zero Binary Dependencies",
    md2docx: "Pure TypeScript / JavaScript",
    pandoc: "Requires Haskell/C++ binary",
    docxJs: "Pure JavaScript",
    htmlDocx: "Pure JavaScript",
  },
  {
    feature: "LaTeX Equations to OMML",
    md2docx: "Native Word Math elements",
    pandoc: "Requires LaTeX engine",
    docxJs: "Manual MathRuns required",
    htmlDocx: "Not supported",
  },
  {
    feature: "Mermaid to Embedded Vector",
    md2docx: "Automatic SVG + self-healing",
    pandoc: "Requires external filter / CLI",
    docxJs: "Manual image buffers",
    htmlDocx: "Not supported",
  },
  {
    feature: "Extensible Plugin Pipeline",
    md2docx: "Standard Unified / Remark plugins",
    pandoc: "Lua filters",
    docxJs: "Imperative function wrappers",
    htmlDocx: "None",
  },
  {
    feature: "Serverless & Edge Ready",
    md2docx: "Lightweight (~35-40kB core)",
    pandoc: "Heavy container footprint",
    docxJs: "Lightweight",
    htmlDocx: "Limited support",
  },
];

export const ComparisonMatrix = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-4">
            Feature Comparison
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-4">
            How Md2Docx Compares
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            See how Md2Docx stacks up against traditional CLI binaries,
            imperative libraries, and HTML wrappers.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-border/60 shadow-sm bg-card">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="py-4 px-6 font-semibold text-foreground text-sm">
                  Feature / Capability
                </th>
                <th className="py-4 px-6 font-bold text-primary text-sm bg-primary/5">
                  Md2Docx
                </th>
                <th className="py-4 px-6 font-medium text-muted-foreground text-sm">
                  Pandoc
                </th>
                <th className="py-4 px-6 font-medium text-muted-foreground text-sm">
                  docx.js alone
                </th>
                <th className="py-4 px-6 font-medium text-muted-foreground text-sm">
                  html-docx-js
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-sm">
              {matrix.map((row) => (
                <tr
                  key={row.feature}
                  className="hover:bg-muted/20 transition-colors"
                >
                  <td className="py-4 px-6 font-medium text-foreground">
                    {row.feature}
                  </td>
                  <td className="py-4 px-6 font-semibold text-primary bg-primary/5 flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{row.md2docx}</span>
                  </td>
                  <td className="py-4 px-6 text-muted-foreground">
                    {row.pandoc}
                  </td>
                  <td className="py-4 px-6 text-muted-foreground">
                    {row.docxJs}
                  </td>
                  <td className="py-4 px-6 text-muted-foreground">
                    {row.htmlDocx}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
