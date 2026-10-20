import { readFileSync } from "node:fs";
import path from "node:path";
import { toDocx } from "mdast2docx";
import { listPlugin, mathPlugin, tablePlugin } from "mdast2docx/plugins";
import { nodeImagePlugin } from "mdast2docx/plugins/node";
import { type NextRequest, NextResponse } from "next/server";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import { unified } from "unified";

const docxProcessor = unified()
  .use(remarkFrontmatter)
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkMath);

const getServerPlugins = () => [
  listPlugin(),
  tablePlugin(),
  mathPlugin(),
  nodeImagePlugin(),
];

/**
 * Renders Markdown AST to DOCX and returns a streaming attachment response with profiling headers.
 */
const generateDocxResponse = async (
  markdown: string,
  filename: string,
  fileProps: Parameters<typeof toDocx>[1] = {},
): Promise<NextResponse> => {
  const start = performance.now();
  const mdast = docxProcessor.parse(markdown);
  const buffer = await toDocx(
    mdast,
    fileProps,
    { plugins: getServerPlugins() },
    "arraybuffer",
  );
  const renderTimeMs = Math.round(performance.now() - start);

  return new NextResponse(new Uint8Array(buffer as ArrayBuffer), {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "X-Render-Time": `${renderTimeMs}`,
      "Server-Timing": `render;dur=${renderTimeMs}`,
      "Access-Control-Expose-Headers": "X-Render-Time, Server-Timing",
    },
  });
};

/**
 * Generate a docx file from markdown on server side.
 * GET: Converts monorepo root sample.md
 * POST: Converts request body { markdown }
 */
export const GET = async () => {
  try {
    const samplePath = path.resolve(process.cwd(), "../../sample.md");
    const md = readFileSync(samplePath, "utf-8");
    return await generateDocxResponse(md, "sample.docx", {
      title: "Markdown Syntax Showcase",
    });
  } catch (error) {
    console.error("Error generating DOCX:", error);
    return NextResponse.json(
      { error: "Failed to generate DOCX document" },
      { status: 500 },
    );
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const md = body?.markdown || "# Empty Document";
    return await generateDocxResponse(md, "document.docx");
  } catch (error) {
    console.error("Error generating DOCX from body:", error);
    return NextResponse.json(
      { error: "Failed to generate DOCX document" },
      { status: 500 },
    );
  }
};
