import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { common, createLowlight } from "lowlight";
import { mermaidGrammar } from "lowlight-mermaid";
import type { ReactNode } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";

export const lowlight = createLowlight(common);
lowlight.register("mermaid", mermaidGrammar);

/**
 * Highlights source code using lowlight with built-in Mermaid diagram grammar support,
 * returning native React elements without any dangerouslySetInnerHTML.
 */
export const highlightCode = (
  code: string,
  language = "typescript",
): ReactNode => {
  if (!code) return null;
  try {
    const lang = lowlight.registered(language) ? language : "typescript";
    const tree = lowlight.highlight(lang, code.trim());
    return toJsxRuntime(tree, { Fragment, jsx, jsxs });
  } catch {
    try {
      const tree = lowlight.highlightAuto(code.trim());
      return toJsxRuntime(tree, { Fragment, jsx, jsxs });
    } catch {
      return code;
    }
  }
};
