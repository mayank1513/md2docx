import type { Element, Root as HastRoot } from "hast";
import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import type { Root } from "mdast";
import {
  type FC,
  type HTMLProps,
  isValidElement,
  type JSX,
  type ReactNode,
} from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import remarkParse from "remark-parse";
import remarkRehype, { type Options } from "remark-rehype";
import { type PluggableList, unified } from "unified";
import { visit } from "unist-util-visit";

export const handleAriaAndDataProps = (properties: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(properties).map(([key, value]) => [
      key.startsWith("data")
        ? key.replace(
            /[A-Z]+(?![a-z])|[A-Z]/g,
            (match) => `-${match.toLowerCase()}`,
          )
        : key.startsWith("aria")
          ? key.replace("aria", "aria-").toLowerCase()
          : key,
      value,
    ]),
  );

export const uuid = () => crypto.randomUUID();

export type IntrinsicProps = JSX.IntrinsicElements[keyof JSX.IntrinsicElements];

/**
 * Extended component props to support custom HTML components
 * and HAST Element reference.
 */
export type ComponentProps = IntrinsicProps & {
  node: Element;
};

export type AstArrayElement = { mdast: Root; hast: HastRoot };

export type AstRef = { current?: AstArrayElement[] };

/**
 * Props accepted by the main `<Md />` component for rendering Markdown.
 */
export interface MdxProps extends HTMLProps<HTMLDivElement> {
  /**
   * Optional wrapper element. Defaults to `<div>` if additional props are passed, otherwise uses `Fragment`.
   */
  wrapper?: keyof JSX.IntrinsicElements;

  /**
   * Optional `remark` plugins used during markdown parsing.
   */
  remarkPlugins?: PluggableList;

  /**
   * Optional `rehype` plugins used during markdown-to-HTML conversion.
   */
  rehypePlugins?: PluggableList;

  /**
   * Options passed to `remark-rehype` for controlling transformation.
   */
  remarkRehypeOptions?: Options;

  /**
   * Optional reference to access the parsed MDAST and HAST trees.
   */
  astRef?: AstRef;

  /**
   * Custom React components to override specific HTML tags.
   */
  components?: Partial<Record<keyof JSX.IntrinsicElements, FC<ComponentProps>>>;

  /**
   * If true, skips raw HTML rendering in markdown content.
   */
  skipHtml?: boolean;
}

export interface MdProps extends MdxProps {
  children?: string;
}

/**
 * Internal component that parses markdown string into MDAST and HAST,
 * and renders it using the JSX runtime.
 */
export const Markdown = ({
  children,
  remarkPlugins = [],
  rehypePlugins = [],
  remarkRehypeOptions,
  astRef,
  chunkIndex = 0,
  components,
  skipHtml,
}: MdProps & { chunkIndex?: number }) => {
  const processor = unified()
    .use(remarkParse)
    .use(remarkPlugins)
    .use(remarkRehype, {
      ...remarkRehypeOptions,
      allowDangerousHtml: !skipHtml,
    })
    .use(rehypePlugins);

  const mdast = processor.parse(children ?? "");
  const hast = processor.runSync(mdast);
  if (astRef) {
    if (!astRef.current) astRef.current = [];
    astRef.current[chunkIndex] = { mdast, hast };
  }

  visit(hast, (node, index, parent) => {
    if (node.type === "raw" && parent && typeof index === "number") {
      if (skipHtml) {
        parent.children.splice(index, 1);
      } else {
        parent.children[index] = { type: "text", value: node.value };
      }
    }
    if (node.type === "element")
      (node.properties as Record<string, unknown>).src ||= null;
  });

  return toJsxRuntime(hast, {
    Fragment,
    components,
    ignoreInvalidStyle: true,
    jsx,
    jsxs,
    passKeys: true,
    passNode: true,
  });
};

/**
 * Renders markdown content inside a dynamic wrapper element ('div' or Fragment).
 */
export const renderWithWrapper = <T extends MdxProps>(
  props: T,
  renderContent: (markdownProps: Omit<T, "wrapper" | "children">) => ReactNode,
): ReactNode => {
  const {
    wrapper,
    remarkPlugins,
    rehypePlugins,
    remarkRehypeOptions,
    astRef,
    components,
    skipHtml,
    children: _,
    ...restProps
  } = props;
  const Wrapper = wrapper ?? (Object.keys(restProps).length ? "div" : Fragment);

  return (
    // @ts-expect-error - props are valid for HTML elements but cannot be statically inferred on Fragment
    <Wrapper {...restProps}>
      {renderContent({
        remarkPlugins,
        rehypePlugins,
        remarkRehypeOptions,
        astRef,
        components,
        skipHtml,
      } as Omit<T, "wrapper" | "children">)}
    </Wrapper>
  );
};

export interface MarkdownRecursiveProps {
  children: ReactNode;
  markdownProps: Omit<MdxProps, "wrapper">;
  cursor: { index: number };
}

/**
 * Creates a recursive markdown renderer that traverses React children
 * and replaces string content with rendered markdown.
 */
export const createMarkdownRecursive = (
  MarkdownComponent: FC<MdProps & { chunkIndex?: number }>,
  supportArrays = false,
) => {
  const Recursive: FC<MarkdownRecursiveProps> = ({
    children,
    markdownProps,
    cursor,
  }: MarkdownRecursiveProps): ReactNode => {
    if (typeof children === "string") {
      return (
        <MarkdownComponent {...markdownProps} chunkIndex={cursor.index++}>
          {children}
        </MarkdownComponent>
      );
    }

    if (supportArrays && Array.isArray(children)) {
      return children.map((child, id) => {
        const childKey = `${cursor.index}-${id}`;
        return (
          <Recursive
            key={childKey}
            markdownProps={markdownProps}
            cursor={cursor}
          >
            {child}
          </Recursive>
        );
      });
    }

    if (isValidElement(children)) {
      const Tag = children.type;
      const innerProps = children.props as IntrinsicProps;

      return (
        <Tag {...(innerProps as IntrinsicProps)}>
          <Recursive markdownProps={markdownProps} cursor={cursor}>
            {(innerProps as IntrinsicProps).children}
          </Recursive>
        </Tag>
      );
    }

    /* v8 ignore next 2 should never reach here, but in case */
    return children;
  };

  return Recursive;
};

/**
 * Renders markdown inside a wrapper, traversing children recursively and updating astRef.
 */
export const renderRecursiveMarkdown = (
  props: MdxProps,
  children: ReactNode,
  Recursive: FC<MarkdownRecursiveProps>,
) =>
  renderWithWrapper(props, (markdownProps) => {
    const cursor = { index: 0 };
    const content = (
      <Recursive markdownProps={markdownProps} cursor={cursor}>
        {children}
      </Recursive>
    );
    if (props.astRef?.current) {
      props.astRef.current.length = cursor.index;
    }
    return content;
  });
