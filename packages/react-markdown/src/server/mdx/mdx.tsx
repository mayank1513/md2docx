import {
  createMarkdownRecursive,
  Markdown,
  type MdxProps,
  renderRecursiveMarkdown,
} from "../../utils";

const MarkdownRecursive = createMarkdownRecursive(Markdown, true);

/**
 * The Markdown renderer component.
 * Provides a safe, SSR-compatible way to render markdown with support for:
 * - Custom wrappers
 * - Plugin pipelines (remark + rehype)
 * - Component overrides
 * - Optional raw HTML stripping
 */
export const Mdx = ({ children, ...props }: MdxProps) =>
  renderRecursiveMarkdown(props, children, MarkdownRecursive);
