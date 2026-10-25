import {
  Brain,
  FileCheck2,
  LayoutTemplate,
  Puzzle,
  Sparkles,
  Terminal,
  Zap,
} from "lucide-react";

const features = [
  {
    title: "Universal Dual Execution",
    description:
      "Compile 100% in the browser with WebAssembly & JS for zero latency and complete data privacy, or stream headlessly in Node.js backends and serverless workers.",
    icon: Zap,
    tag: "Client & Server",
  },
  {
    title: "Native OpenXML Fidelity",
    description:
      "Translates Markdown AST nodes into genuine Microsoft Word structures — native MathML equations, editable tables, vector graphics, and true outline numbering.",
    icon: FileCheck2,
    tag: "Clean OpenXML",
  },
  {
    title: "Pluggable Core & Rich Official Plugins",
    description:
      "Engineered on the Unified & Remark AST ecosystem. Leverage our comprehensive suite of official plugins or write custom plugins.",
    icon: Puzzle,
    tag: "Pluggable & Extensible",
  },
  {
    title: "Executive Cover Pages & Callouts",
    description:
      "Turn YAML/TOML frontmatter into professional title pages, divider rules, author metadata lines, page breaks, and callout banners with zero manual markup.",
    icon: LayoutTemplate,
    tag: "Layout Synthesis",
  },
  {
    title: "Zero-Config Terminal CLI",
    description:
      "Run instant document compilation via npx @m2d/cli or in CI/CD release pipelines with structured logging, configuration files, and multiple binary aliases.",
    icon: Terminal,
    tag: "CLI Automation",
  },
  {
    title: "Generative AI Document Bridge",
    description:
      "Transform raw Markdown output from ChatGPT, Claude, and Gemini into corporate-ready Word deliverables with robust self-healing and error resiliency.",
    icon: Brain,
    tag: "AI Ready",
  },
];

export const CoreFeatures = () => {
  return (
    <section className="py-24 bg-muted/20 border-y border-border/40">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-4">
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            Engineered for Modern Workflows
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-4">
            Why Developers & Enterprises Choose Md2Docx
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A purpose-built document compiler that balances lightweight frontend
            privacy with robust server-side automation.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group relative p-8 rounded-2xl bg-card border border-border/50 hover:border-primary/40 transition-all duration-300 hover:shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                      {feature.tag}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
