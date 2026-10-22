import type { IPlugin } from "@m2d/core";
import {
  createHtmlPlugin,
  type DocumentLike,
  type HtmlPluginOptions,
} from "@m2d/html";
import { parseHTML } from "linkedom";

export interface NodeHtmlPluginOptions extends HtmlPluginOptions {
  /**
   * Custom linkedom or DOM document instance.
   * If omitted, a persistent linkedom document is created automatically.
   */
  document?: DocumentLike;
}

let cachedDoc: DocumentLike | undefined;

const getDefaultDocument = (): DocumentLike => {
  if (!cachedDoc) {
    cachedDoc = parseHTML("<!DOCTYPE html><html><body></body></html>").document;
  }
  return cachedDoc;
};

/**
 * HTML plugin for MDAST-to-DOCX conversion on Node.js.
 * Converts inline and block-level HTML content within markdown into structured MDAST nodes
 * using linkedom for lightweight server-side DOM processing.
 *
 * @param options - Plugin options including custom document instance.
 * @returns Configured HTML plugin for Node.js.
 */
export const nodeHtmlPlugin: (options?: NodeHtmlPluginOptions) => IPlugin = (
  options,
) => {
  const doc = options?.document ?? getDefaultDocument();
  return createHtmlPlugin({ document: doc })();
};

export const htmlNodePlugin = nodeHtmlPlugin;
export const htmlPlugin = nodeHtmlPlugin;
