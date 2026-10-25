import { isValidElement, type ReactNode } from "react";
import {
  type IntrinsicProps,
  Markdown,
  type MdxProps,
  renderWithWrapper,
} from "../../utils";

interface MarkdownRecursiveProps {
  children: ReactNode;
  markdownProps: Omit<MdxProps, "wrapper">;
  cursor: { index: number };
}

/**
 * Recursively traverses React children and injects markdown rendering
 * into string-based content, preserving JSX wrapper structure.
 */
const MarkdownRecursive = ({
  children,
  markdownProps,
  cursor,
}: MarkdownRecursiveProps) => {
  if (typeof children === "string") {
    return (
      <Markdown {...markdownProps} chunkIndex={cursor.index++}>
        {children}
      </Markdown>
    );
  }

  if (Array.isArray(children)) {
    return children.map((child, id) => {
      const childKey = `${cursor.index}-${id}`;
      return (
        <MarkdownRecursive key={childKey} {...{ markdownProps, cursor }}>
          {child}
        </MarkdownRecursive>
      );
    });
  }

  if (isValidElement(children)) {
    const Tag = children.type;
    const innerProps = children.props as IntrinsicProps;

    return (
      <Tag {...(innerProps as IntrinsicProps)}>
        <MarkdownRecursive {...{ markdownProps, cursor }}>
          {(innerProps as IntrinsicProps).children}
        </MarkdownRecursive>
      </Tag>
    );
  }
  // Non-string, non-element nodes are returned as-is
  /* v8 ignore next 2 should never reach here, but in case */
  return children;
};

/**
 * The Markdown renderer component.
 * Provides a safe, SSR-compatible way to render markdown with support for:
 * - Custom wrappers
 * - Plugin pipelines (remark + rehype)
 * - Component overrides
 * - Optional raw HTML stripping
 */
export const Mdx = ({ children, ...props }: MdxProps) =>
  renderWithWrapper(props, (markdownProps) => {
    const cursor = { index: 0 };
    const content = (
      <MarkdownRecursive markdownProps={markdownProps} cursor={cursor}>
        {children}
      </MarkdownRecursive>
    );
    if (props.astRef?.current) {
      props.astRef.current.length = cursor.index;
    }
    return content;
  });
