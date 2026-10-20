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
- \`mdast2docx\`: Umbrella package providing CLI and batteries-included converters with all plugins.
- \`@m2d/core\`: Headless AST compiler, plugin lifecycle, and document generator.
- \`@m2d/image\`: Universal image loader and dimension calculator (browser & Node).
- \`@m2d/image-node\`: Node-specific image fetcher and file loader.
- \`@m2d/mermaid\`: Mermaid diagram renderer to DOCX images.
- \`@m2d/mermaid-node\`: Headless Node Mermaid rasterization via sharp/resvg.
- \`@m2d/math\`: LaTeX to native Word Office Math Markup Language (OMML).
- \`@m2d/table\`: GitHub Flavored Markdown (GFM) table formatting, borders, and column alignment.
- \`@m2d/list\`: Multi-level ordered/unordered lists with indentation preservation.
- \`@m2d/html\`: Raw HTML sanitization and conversion into Word elements.
- \`@m2d/remark-docx\`: Unified/Remark compiler plugin.
- \`@m2d/react-markdown\`: React components and hooks for client-side document export.

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
