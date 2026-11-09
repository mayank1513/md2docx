import type { EmptyNode, IPlugin } from "@m2d/core";
import { AlignmentType, BorderStyle, ShadingType, WidthType } from "docx";
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
  blockType: "table",
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
    block: (docx, node) => {
      if (node.type !== "code") return [];

      // Mark node as handled so md2docx core skips its default code handler
      (node as unknown as { type: string }).type = "";

      const rawCode = (node as unknown as { value?: string }).value ?? "";
      const rawLang = (node as unknown as { lang?: string }).lang;
      const rawMeta = (node as unknown as { meta?: string }).meta;

      // Extract node-level overrides
      const nodeData =
        (node as unknown as { data?: Record<string, unknown> }).data ?? {};
      const activeThemeName = (nodeData.theme as string) ?? mergedOptions.theme;
      const theme = resolveTheme(activeThemeName, options.customThemes);

      const hasMetaLineNumbers = Boolean(
        rawMeta && /\b(showLineNumbers|lineNumbers|lines)\b/i.test(rawMeta),
      );
      const showLineNumbers =
        (nodeData.lineNumbers as boolean | undefined) ??
        (hasMetaLineNumbers || mergedOptions.lineNumbers);

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

      const subtleBorder = {
        style: BorderStyle.SINGLE,
        size: 1,
        color: cleanHex(theme.border ?? theme.gutterBackground),
      };
      const noneBorder = {
        style: BorderStyle.NONE,
      };

      // 1. Two-Column Table with Gutter & Line Numbers
      if (showLineNumbers) {
        const totalLines = codeLines.length;
        const lineNumDigits = String(
          totalLines + mergedOptions.gutterStart - 1,
        ).length;
        const gutterWidthPercent =
          options.gutterWidthPercent ??
          Math.max(6, Math.min(15, lineNumDigits * 2 + 3));
        const codeWidthPercent = 100 - gutterWidthPercent;

        const rows = codeLines.map((line, idx) => {
          const lineNumber = idx + mergedOptions.gutterStart;
          const runs = createRunsForLine(
            docx,
            line,
            theme,
            fontFamily,
            fontSize,
            tabSize,
          );

          let gutterBg = theme.gutterBackground;
          let codeBg = theme.background;
          let gutterTextColor = theme.gutterText;

          if (line.diffType === "add") {
            gutterBg = theme.diffAddBackground;
            codeBg = theme.diffAddBackground;
            gutterTextColor = theme.diffAddText;
          } else if (line.diffType === "delete") {
            gutterBg = theme.diffDeleteBackground;
            codeBg = theme.diffDeleteBackground;
            gutterTextColor = theme.diffDeleteText;
          }

          return new docx.TableRow({
            cantSplit: true,
            children: [
              new docx.TableCell({
                width: { size: gutterWidthPercent, type: WidthType.PERCENTAGE },
                shading: {
                  type: ShadingType.SOLID,
                  fill: cleanHex(gutterBg),
                },
                margins: {
                  top: 20,
                  bottom: 20,
                  left: 60,
                  right: 60,
                },
                children: [
                  new docx.Paragraph({
                    alignment: AlignmentType.RIGHT,
                    spacing: { before: 0, after: 0, line: 240 },
                    children: [
                      new docx.TextRun({
                        text: String(lineNumber),
                        font: { name: fontFamily },
                        size: fontSize,
                        color: cleanHex(gutterTextColor),
                      }),
                    ],
                  }),
                ],
              }),
              new docx.TableCell({
                width: { size: codeWidthPercent, type: WidthType.PERCENTAGE },
                shading: {
                  type: ShadingType.SOLID,
                  fill: cleanHex(codeBg),
                },
                margins: {
                  top: 20,
                  bottom: 20,
                  left: 100,
                  right: 60,
                },
                children: [
                  new docx.Paragraph({
                    alignment: AlignmentType.LEFT,
                    spacing: { before: 0, after: 0, line: 240 },
                    children:
                      runs.length > 0
                        ? runs
                        : [
                            new docx.TextRun({
                              text: " ",
                              font: { name: fontFamily },
                              size: fontSize,
                            }),
                          ],
                  }),
                ],
              }),
            ],
          });
        });

        const table = new docx.Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: subtleBorder,
            bottom: subtleBorder,
            left: subtleBorder,
            right: subtleBorder,
            insideHorizontal: noneBorder,
            insideVertical: subtleBorder,
          },
          rows,
        });

        return [table];
      }

      // 2. Line numbers false - Single Shaded Block (Table or Paragraph)
      if (mergedOptions.blockType === "paragraph") {
        const paragraphRuns: import("docx").TextRun[] = [];

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
                ...(lineIndex > 0 ? { break: 1 } : {}),
              }),
            );
          }

          paragraphRuns.push(...lineRuns);
        });

        const para = new docx.Paragraph({
          alignment: AlignmentType.LEFT,
          keepLines: true,
          spacing: { before: 100, after: 100, line: 240 },
          shading: {
            type: ShadingType.SOLID,
            fill: cleanHex(theme.background),
          },
          border: {
            top: subtleBorder,
            bottom: subtleBorder,
            left: subtleBorder,
            right: subtleBorder,
          },
          children: paragraphRuns,
        });

        return [para];
      }

      // Default: Table with 1-column padded rows
      const rows = codeLines.map((line) => {
        const runs = createRunsForLine(
          docx,
          line,
          theme,
          fontFamily,
          fontSize,
          tabSize,
        );

        let lineBg = theme.background;
        if (line.diffType === "add") {
          lineBg = theme.diffAddBackground;
        } else if (line.diffType === "delete") {
          lineBg = theme.diffDeleteBackground;
        }

        return new docx.TableRow({
          cantSplit: true,
          children: [
            new docx.TableCell({
              width: { size: 100, type: WidthType.PERCENTAGE },
              shading: {
                type: ShadingType.SOLID,
                fill: cleanHex(lineBg),
              },
              margins: {
                top: 20,
                bottom: 20,
                left: 100,
                right: 60,
              },
              children: [
                new docx.Paragraph({
                  alignment: AlignmentType.LEFT,
                  spacing: { before: 0, after: 0, line: 240 },
                  children:
                    runs.length > 0
                      ? runs
                      : [
                          new docx.TextRun({
                            text: " ",
                            font: { name: fontFamily },
                            size: fontSize,
                          }),
                        ],
                }),
              ],
            }),
          ],
        });
      });

      const table = new docx.Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: subtleBorder,
          bottom: subtleBorder,
          left: subtleBorder,
          right: subtleBorder,
          insideHorizontal: noneBorder,
          insideVertical: noneBorder,
        },
        rows,
      });

      return [table];
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
          color: cleanHex(theme.text),
          shading: {
            type: ShadingType.SOLID,
            fill: cleanHex(theme.background),
          },
        }),
      ];
    },
  };
};

/**
 * Default alias export.
 */
export const code = codePlugin;
