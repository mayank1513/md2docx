import type { EmptyNode, IPlugin } from "@m2d/core";
import { AlignmentType, BorderStyle } from "docx";
import { cleanHex, resolveTheme } from "./themes";
import { parseCodeLines } from "./tokenizer";
import type {
  CodeLine,
  CodePluginFactory,
  ICodePluginOptions,
  ICodeTheme,
  TokenType,
} from "./types";

export const defaultCodeOptions: Required<
  Omit<ICodePluginOptions, "customThemes" | "tokenizer" | "gutterWidthPercent">
> = {
  theme: "github-light",
  lineNumbers: false,
  gutterStart: 1,
  fontFamily: "Consolas",
  fontSize: 19,
  blockType: "paragraph",
  highlightInline: true,
  diffHighlight: true,
  tabSize: 2,
};

/**
 * Maps a token type to its respective theme color.
 */
export const getTokenColor = (type: TokenType, theme: ICodeTheme): string => {
  switch (type) {
    case "keyword":
      return theme.keyword;
    case "string":
      return theme.string;
    case "comment":
      return theme.comment;
    case "number":
      return theme.number;
    case "function":
      return theme.function;
    case "operator":
      return theme.operator;
    case "punctuation":
      return theme.punctuation;
    case "boolean":
      return theme.boolean;
    case "builtin":
      return theme.builtin;
    case "variable":
      return theme.variable;
    case "diffAdd":
      return theme.diffAddText;
    case "diffDelete":
      return theme.diffDeleteText;
    case "diffHeader":
      return theme.diffHeader ?? theme.comment;
    default:
      return theme.text;
  }
};

/**
 * Creates styled docx TextRuns from code line tokens with run coalescing
 * to significantly reduce Word OpenXML node overhead and document bloat.
 */
const createRunsForLine = (
  docx: typeof import("docx"),
  line: CodeLine,
  theme: ICodeTheme,
  fontFamily: string,
  fontSize: number,
  tabSize: number,
  lineBreak = false,
): import("docx").TextRun[] => {
  interface CoalescedRun {
    text: string;
    color: string;
    italics: boolean;
    bold: boolean;
  }

  const coalesced: CoalescedRun[] = [];

  for (const token of line.tokens) {
    let text = token.value;
    if (tabSize > 0 && text.includes("\t")) {
      text = text.replace(/\t/g, " ".repeat(tabSize));
    }

    let color = getTokenColor(token.type, theme);
    if (line.diffType === "add" && token.type === "diffAdd") {
      color = theme.diffAddText;
    } else if (line.diffType === "delete" && token.type === "diffDelete") {
      color = theme.diffDeleteText;
    }

    const cleanedColor = cleanHex(color);
    const italics = token.type === "comment";
    const bold = token.type === "keyword" && theme.name === "executive-print";

    const last = coalesced[coalesced.length - 1];
    if (
      last &&
      last.color === cleanedColor &&
      last.italics === italics &&
      last.bold === bold
    ) {
      last.text += text;
    } else {
      coalesced.push({
        text,
        color: cleanedColor,
        italics,
        bold,
      });
    }
  }

  return coalesced.map(
    (item, index) =>
      new docx.TextRun({
        text: item.text,
        font: { name: fontFamily },
        size: fontSize,
        style: "code",
        color: item.color,
        ...(lineBreak && index === 0 ? { break: 1 } : {}),
        italics: item.italics,
        bold: item.bold,
      }),
  );
};

/**
 * Code highlighting and formatting plugin for md2docx.
 */
export const codePlugin: CodePluginFactory = (
  options: ICodePluginOptions = {},
): IPlugin<EmptyNode> => {
  const mergedOptions = {
    ...defaultCodeOptions,
    ...options,
  };

  return {
    block: (docx, node, paraProps) => {
      if (node.type !== "code") return [];

      // Mark node as handled so md2docx core skips its default code handler
      (node as unknown as { type: string }).type = "";

      const rawCode = (node as unknown as { value?: string }).value ?? "";
      const rawLang = (node as unknown as { lang?: string }).lang;

      // Extract node-level overrides
      const nodeData =
        (node as unknown as { data?: Record<string, unknown> }).data ?? {};
      const activeThemeName = (nodeData.theme as string) ?? mergedOptions.theme;
      const theme = resolveTheme(activeThemeName, options.customThemes);

      const fontFamily =
        (nodeData.fontFamily as string) ?? mergedOptions.fontFamily;
      const fontSize = (nodeData.fontSize as number) ?? mergedOptions.fontSize;
      const tabSize = mergedOptions.tabSize;

      const codeLines = parseCodeLines(
        rawCode,
        rawLang,
        mergedOptions.diffHighlight,
        options.tokenizer,
      );

      const children: import("docx").TextRun[] = [];

      codeLines.forEach((line, lineIndex) => {
        const lineRuns = createRunsForLine(
          docx,
          line,
          theme,
          fontFamily,
          fontSize,
          tabSize,
          lineIndex > 0,
        );

        if (lineRuns.length === 0) {
          lineRuns.push(
            new docx.TextRun({
              text: " ",
              font: { name: fontFamily },
              size: fontSize,
              style: "code",
              ...(lineIndex > 0 ? { break: 1 } : {}),
            }),
          );
        }

        children.push(...lineRuns);
      });

      return [
        new docx.Paragraph({
          border: {
            bottom: { style: BorderStyle.SINGLE, space: 5, size: 1 },
            left: { style: BorderStyle.SINGLE, space: 10, size: 1 },
            right: { style: BorderStyle.SINGLE, space: 5, size: 1 },
            top: { style: BorderStyle.SINGLE, space: 6, size: 1 },
          },
          ...paraProps,
          alignment: AlignmentType.LEFT,
          style: "blockCode",
          keepLines: true,
          children,
        }),
      ];
    },

    inline: (docx, node) => {
      if (node.type !== "inlineCode" || !mergedOptions.highlightInline) {
        return [];
      }

      (node as unknown as { type: string }).type = "";
      const rawValue = (node as unknown as { value?: string }).value ?? "";
      const nodeData =
        (node as unknown as { data?: Record<string, unknown> }).data ?? {};
      const activeThemeName = (nodeData.theme as string) ?? mergedOptions.theme;
      const theme = resolveTheme(activeThemeName, options.customThemes);
      const fontFamily =
        (nodeData.fontFamily as string) ?? mergedOptions.fontFamily;
      const fontSize = (nodeData.fontSize as number) ?? mergedOptions.fontSize;

      return [
        new docx.TextRun({
          text: rawValue,
          font: { name: fontFamily },
          size: fontSize,
          style: "code",
          color: cleanHex(theme.text),
        }),
      ];
    },
  };
};

/**
 * Default alias export.
 */
export const code = codePlugin;
