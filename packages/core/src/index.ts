import { Document, type OutputType, Packer, type Paragraph } from "docx";
import type { Root } from "mdast";
import { toSection } from "./section";
import {
  DEFAULT_SECTION_PROPS,
  defaultDocxProps,
  getDefinitions,
  type IDocxProps,
  type ISectionProps,
} from "./utils";

/**
 * Represents the input Markdown AST tree(s) for conversion.
 * Supports either:
 * - A single `Root` node (direct conversion)
 * - An array of objects `{ ast: Root, props?: ISectionProps }` for fine-grained section-level control.
 */
type IInputMDAST = Root | { ast: Root; props?: ISectionProps }[];

/**
 * Converts an MDAST (Markdown Abstract Syntax Tree) into a DOCX document.
 * @param astInputs - A single or multiple MDAST trees with optional section properties.
 * @param docxProps - General document properties. @see https://docx.js.org/#/usage/document
 * @param defaultSectionProps - Default properties for each document section. @see https://docx.js.org/#/usage/sections
 * @param outputType - The desired output format (default: `"blob"`). @see https://docx.js.org/#/usage/packers
 * @returns A DOCX document in the specified format.
 */
export const toDocx = async (
  astInputs: IInputMDAST,
  docxProps: IDocxProps = {},
  defaultSectionProps: ISectionProps = DEFAULT_SECTION_PROPS,
  outputType: OutputType = "blob",
) => {
  // Stores footnotes indexed by their unique ID
  const footnotes: Record<number, { children: Paragraph[] }> = {};

  const finalDocxProps = { ...defaultDocxProps, ...docxProps };

  const sharedDefScope = finalDocxProps.definitionsScope === "shared";

  const plugins = [...(defaultSectionProps?.plugins ?? [])];

  const inputs = Array.isArray(astInputs) ? astInputs : [{ ast: astInputs }];

  const defs = inputs.map(({ ast }) => getDefinitions(ast.children));

  const sharedDefs = {
    definitions: {},
    footnoteDefinitions: {},
  };

  if (sharedDefScope) {
    for (const def of defs) {
      Object.assign(sharedDefs.definitions, def.definitions);
      Object.assign(sharedDefs.footnoteDefinitions, def.footnoteDefinitions);
    }
  }

  // Precompute deterministic offsets.
  let nextFootnoteId = 0;

  const footnoteOffsets = defs.map(({ footnoteDefinitions }) => {
    const offset = nextFootnoteId;
    nextFootnoteId += Object.keys(footnoteDefinitions).length;
    return offset;
  });

  const processedAstInputs = await Promise.all(
    inputs.map(async ({ ast, props }, idx) => {
      const { definitions, footnoteDefinitions } = defs[idx];

      const { footnoteProps, ...sectionProps } = {
        ...defaultSectionProps,
        ...props,
      };

      // Prefer local over shared.
      const resolvedDefinitions = sharedDefScope
        ? { ...sharedDefs.definitions, ...definitions }
        : definitions;

      const resolvedFootnoteDefinitions = sharedDefScope
        ? { ...sharedDefs.footnoteDefinitions, ...footnoteDefinitions }
        : footnoteDefinitions;

      await Promise.all(
        Object.values(footnoteDefinitions).map(async (footnote, index) => {
          const footnoteId = footnoteOffsets[idx] + index + 1;

          footnote.id = footnoteId;

          footnotes[footnoteId] = (await toSection(
            { type: "root", children: footnote.children },
            resolvedDefinitions,
            {},
            { footnoteProps },
          )) as { children: Paragraph[] };
        }),
      );

      plugins.push(...(sectionProps.plugins ?? []));

      return {
        ast,
        props: sectionProps,
        definitions: resolvedDefinitions,
        footnoteDefinitions: resolvedFootnoteDefinitions,
      };
    }),
  );

  // Apply global document-level modifications
  plugins.forEach((plugin) => {
    plugin?.root?.(finalDocxProps);
  });

  // Convert MDAST trees into document sections (and update docxProps during section traversal)
  const sections = await Promise.all(
    processedAstInputs.map(({ ast, props, definitions, footnoteDefinitions }) =>
      toSection(ast, definitions, footnoteDefinitions, props, finalDocxProps),
    ),
  );

  plugins.forEach((plugin) => {
    plugin?.postprocess?.(sections);
  });

  // Create DOCX document
  const doc = new Document({
    ...finalDocxProps,
    footnotes,
    sections,
  });

  return Packer.pack(doc, outputType);
};

export type * from "@m2d/mdast";
export type { IPlugin } from "./utils";
export type { IDocxProps, IInputMDAST, ISectionProps };
