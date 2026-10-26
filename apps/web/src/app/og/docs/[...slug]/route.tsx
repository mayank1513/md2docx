import { generate as DefaultImage } from "fumadocs-ui/og";
import { notFound } from "next/navigation";
import { ImageResponse } from "next/og";
import { getPageImage, source } from "@/lib/source";

export const dynamic = "force-static";
export const revalidate = false;

export async function GET(
  _req: Request,
  { params }: RouteContext<"/og/docs/[...slug]">,
) {
  const { slug } = await params;
  const page = source.getPage(slug.slice(0, -1));
  if (!page) notFound();

  return new ImageResponse(
    <DefaultImage
      title={page.data.title}
      description={page.data.description}
      site="Md2Docx"
    />,
    {
      width: 1200,
      height: 630,
    },
  );
}

/**
 * On-demand generation for OG images:
 * Pre-generate only critical root entry points at build time, generating others when requested.
 */
export function generateStaticParams() {
  const defaultPages = source
    .getPages()
    .filter((p) => p.slugs.length === 0 || p.slugs[0] === "overview");

  return defaultPages.map((page) => ({
    lang: page.locale,
    slug: getPageImage(page).segments,
  }));
}
