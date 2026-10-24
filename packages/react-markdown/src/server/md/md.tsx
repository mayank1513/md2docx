import { Markdown, type MdProps, renderWithWrapper } from "../../utils";

/**
 * The Markdown renderer component.
 * Provides a safe, SSR-compatible way to render markdown with support for:
 * - Custom wrappers
 * - Plugin pipelines (remark + rehype)
 * - Component overrides
 * - Optional raw HTML stripping
 */
export const Md = ({ children, ...props }: MdProps) =>
  renderWithWrapper(props, (markdownProps) => (
    <Markdown {...markdownProps}>{children}</Markdown>
  ));
