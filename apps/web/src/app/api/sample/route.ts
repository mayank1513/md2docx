import { readFileSync } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

export const dynamic = "force-static";

export const GET = async () => {
  try {
    const samplePath = path.resolve(process.cwd(), "../../sample.md");
    const markdown = readFileSync(samplePath, "utf-8");
    return NextResponse.json({ markdown });
  } catch (err) {
    console.error("Failed to read sample.md:", err);
    return NextResponse.json(
      { error: "Failed to load sample.md" },
      { status: 500 },
    );
  }
};
