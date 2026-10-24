import type { PRESETS } from "./constants";

export type PresetId = (typeof PRESETS)[number]["id"];

export type TargetId = "md2docx" | "mdast2docx" | "remark-docx";

export interface TargetOption {
  id: TargetId;
  name: string;
  badge: string;
  desc: string;
  isServer?: boolean;
}

export type PluginId =
  | "frontmatter"
  | "math"
  | "mermaid"
  | "image"
  | "table"
  | "list"
  | "html"
  | "emoji";

export interface PluginDefinition {
  id: PluginId;
  name: string;
  fnName: string;
  icon: React.ComponentType<{ className?: string }>;
  desc: string;
}

export type ViewMode = "edit" | "preview" | "code" | "tiptap";

export type TimingResult = {
  mode: "client" | "server";
  targetName: string;
  renderTimeMs: number;
  networkTimeMs?: number;
  totalTimeMs: number;
  sizeKb: number;
};
