import type {
  AlignmentType,
  DocPropertiesOptions,
  IBorderOptions,
  IBordersOptions,
  IFrameOptions,
  IImageOptions,
  UnderlineType,
} from "docx";
import type {
  Data as MdastData,
  Node,
  Parent,
  PhrasingContent,
  RootContent,
} from "mdast";
import type { RenderResult } from "mermaid";
import type { Mutable } from "./utils";

/**
 * This is used to avoid multiple times processing of a given node.
 * Acts like event.stopPropagation.
 */
export interface EmptyNode extends Node {
  type: "";
  /** original type of the node */
  _type: string;
  [key: string]: unknown;
}

export interface FragmentData extends MdastData {}

export interface Fragment extends Parent {
  type: "fragment";
  children: (RootContent | PhrasingContent)[];
  data?: FragmentData;
}

export interface CheckboxData extends MdastData {}

export interface Checkbox extends Node {
  type: "checkbox";
  checked?: boolean;
  data?: CheckboxData;
}

export interface SVGData extends MdastData {
  /**
   * Mermaid source code
   */
  mermaid?: string;
}

export interface SVG extends Node {
  type: "svg";
  value: string | Promise<RenderResult | undefined>;
  data?: SVGData;
}

declare module "mdast" {
  interface BlockContentMap {
    fragment: Fragment;
  }

  interface PhrasingContentMap {
    checkbox: Checkbox;
    empty: EmptyNode;
    fragment: Fragment;
    svg: SVG;
  }

  interface RootContentMap {
    checkbox: Checkbox;
    empty: EmptyNode;
    fragment: Fragment;
    svg: SVG;
  }

  interface ImageData extends Partial<IImageOptions> {
    altText?:
      | DocPropertiesOptions
      | { name?: string; description?: string; title?: string };
    width?: number;
    height?: number;
  }

  interface Data {
    border?: Mutable<IBorderOptions | IBordersOptions>;
    alignment?: (typeof AlignmentType)[keyof typeof AlignmentType];
    bold?: boolean;
    italics?: boolean;
    underline?:
      | {
          type: (typeof UnderlineType)[keyof typeof UnderlineType];
          color: string;
        }
      | Record<string, never>;
    emphasisMark?: Record<string, never>;
    strike?: boolean;
    allCaps?: boolean;
    smallCaps?: boolean;
    subScript?: boolean;
    superScript?: boolean;
    color?: string;
    highlight?: string;
    frame?: IFrameOptions;
    pre?: boolean;
    tag?: keyof (HTMLElementTagNameMap & SVGElementTagNameMap);
    style?: string;
    type?: HTMLInputElement["type"];
    checked?: HTMLInputElement["checked"];
    value?: HTMLInputElement["value"];
    name?: HTMLInputElement["name"];
    altText?:
      | DocPropertiesOptions
      | { name?: string; description?: string; title?: string };
    width?: number;
    height?: number;
  }
}

export type * from "mdast";
export * from "./utils";
