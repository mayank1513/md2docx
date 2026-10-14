import { readFileSync } from "node:fs";
import path from "node:path";
import { toDocx } from "@m2d/core";
import { type NextRequest, NextResponse } from "next/server";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";

const docxProcessor = unified().use(remarkParse).use(remarkGfm);

/**
 * Generate a docx file from markdown on server side.
 * GET: Converts monorepo root sample.md
 * POST: Converts request body { markdown }
 */
export const GET = async () => {
  try {
    const samplePath = path.resolve(process.cwd(), "../../sample.md");
    const md = readFileSync(samplePath, "utf-8");
    const mdast = docxProcessor.parse(md);
    const buffer = await toDocx(
      mdast,
      { title: "Markdown Syntax Showcase" },
      {},
      "arraybuffer",
    );

    return new NextResponse(new Uint8Array(buffer as ArrayBuffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": 'attachment; filename="sample.docx"',
      },
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
    const mdast = docxProcessor.parse(md);
    const buffer = await toDocx(mdast, {}, {}, "arraybuffer");

    return new NextResponse(new Uint8Array(buffer as ArrayBuffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": 'attachment; filename="document.docx"',
      },
    });
  } catch (error) {
    console.error("Error generating DOCX from body:", error);
    return NextResponse.json(
      { error: "Failed to generate DOCX document" },
      { status: 500 },
    );
  }
};
