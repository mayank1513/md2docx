import { notFound } from "next/navigation";
import { getLLMText, source } from "@/lib/source";

export const dynamic = "force-static";
export const revalidate = false;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug?: string[] }> },
) {
  const { slug } = await params;

  const lastParam = slug?.[slug.length - 1];
  let fetchSlug = slug;
  if (lastParam?.endsWith(".mdx")) {
    fetchSlug = [...(slug || [])];
    fetchSlug[fetchSlug.length - 1] = lastParam.replace(/\.mdx$/, "");
  }

  const page = source.getPage(fetchSlug);
  if (!page) notFound();

  return new Response(await getLLMText(page), {
    headers: {
      "Content-Type": "text/markdown",
    },
  });
}

/**
 * On-demand generation for LLM documentation endpoints:
 * Pre-generates only critical entry points at build time, generating others when requested.
 */
export function generateStaticParams() {
  return [{ slug: ["overview.mdx"] }, { slug: ["getting-started.mdx"] }];
}
