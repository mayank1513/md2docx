import { source } from "@/lib/source";

export const dynamic = "force-static";

export async function GET() {
  const pages = source.getPages();
  const pageLinks = pages
    .map(
      (page) =>
        `- [${page.data.title}](${page.url}): ${page.data.description || ""}`,
    )
    .join("\n");

  const content = `# Md2Docx

> Universal Markdown to DOCX converter for Node.js and modern browsers. Converts CommonMark, GFM tables, math (LaTeX/OMML), Mermaid diagrams, and images into clean, native Microsoft Word documents.

## Project Information
- Website: https://md2docx.js.org
- Repository: https://github.com/md2docx/md2docx
- Documentation Dump: https://md2docx.js.org/llms-full.txt
- Execution Targets: Node.js (SSR / streaming / CLI) and modern browsers (zero server data transmission, Web Workers)

## Quick Start (CLI)
\`\`\`bash
npx mdast2docx document.md -o document.docx
\`\`\`

## Quick Start (API)
\`\`\`typescript
import { mdast2docx } from "mdast2docx";

const docxBuffer = await mdast2docx("# Hello World\\n\\nFrom markdown to word.");
\`\`\`

## Package Ecosystem
- \`@m2d/md2docx\`: All-in-one batteries-included Markdown to DOCX converter for browser & client applications.
- \`mdast2docx\`: Umbrella distribution bundle providing toDocx and all official plugins.
- \`@m2d/core\`: Headless AST compiler, plugin lifecycle, and document generator.
- \`@m2d/cli\`: Command-line interface for terminal & batch document generation.
- \`@m2d/table\`: GitHub Flavored Markdown (GFM) table formatting, borders, and column alignment.
- \`@m2d/list\`: Multi-level ordered/unordered lists with hierarchical indentation preservation.
- \`@m2d/math\`: LaTeX to native Word Office Math Markup Language (OMML).
- \`@m2d/mermaid\`: Browser Mermaid diagram renderer with self-healing syntax repair.
- \`@m2d/mermaid-node\`: Headless zero-DOM Node Mermaid rasterization via beautiful-mermaid and sharp.
- \`@m2d/image\`: Universal browser image loader and dimension calculator with IndexedDB caching.
- \`@m2d/image-node\`: Node-specific image fetcher and file loader powered by sharp.
- \`@m2d/html\`: Raw HTML sanitization and conversion into Word elements using browser DOM.
- \`@m2d/html-node\`: Server-side DOM-less HTML parser powered by linkedom.
- \`@m2d/remark-docx\`: Official Unified/Remark compiler plugin for direct DOCX output.
- \`@m2d/remark-docx-node\`: Server-side Remark compiler plugin with native image & Mermaid diagram support.
- \`@m2d/react-markdown\`: React components and hooks for client-side document export.
- \`@m2d/cache\`: High-performance in-memory and persistent caching layer.
- \`@m2d/mdast\`: Extended MDAST and HAST TypeScript type definitions.

## Documentation Index
${pageLinks || "- [Documentation Overview](/docs/overview): Getting started, architecture, and guides."}

## Full Documentation Dump
For the complete unedited text of all guides and API documentation in one stream, query:
https://md2docx.js.org/llms-full.txt
`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
