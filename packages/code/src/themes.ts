import type { ICodeTheme, PresetThemeName } from "./types";

/**
 * Sanitizes hex color string by stripping leading # and trimming whitespace.
 */
export const cleanHex = (hex?: string): string => {
  if (!hex) return "auto";
  const cleaned = hex.trim().replace(/^#/, "").trim();
  return cleaned || "auto";
};

export const GITHUB_LIGHT_THEME: ICodeTheme = {
  name: "github-light",
  text: "#24292e",
  background: "#f6f8fa",
  keyword: "#d73a49",
  string: "#032f62",
  comment: "#6a737d",
  number: "#005cc5",
  function: "#6f42c1",
  operator: "#d73a49",
  punctuation: "#24292e",
  boolean: "#005cc5",
  builtin: "#e36209",
  variable: "#24292e",
  gutterText: "#959da5",
  gutterBackground: "#f0f3f6",
  diffAddBackground: "#e6ffed",
  diffAddText: "#22863a",
  diffDeleteBackground: "#ffeef0",
  diffDeleteText: "#b31d28",
  border: "#e1e4e8",
  diffHeader: "#6a737d",
};

export const GITHUB_DARK_THEME: ICodeTheme = {
  name: "github-dark",
  text: "#c9d1d9",
  background: "#0d1117",
  keyword: "#ff7b72",
  string: "#a5d6ff",
  comment: "#8b949e",
  number: "#79c0ff",
  function: "#d2a8ff",
  operator: "#ff7b72",
  punctuation: "#c9d1d9",
  boolean: "#79c0ff",
  builtin: "#ffa657",
  variable: "#c9d1d9",
  gutterText: "#6e7681",
  gutterBackground: "#161b22",
  diffAddBackground: "#1f3823",
  diffAddText: "#56d364",
  diffDeleteBackground: "#3c1e24",
  diffDeleteText: "#f85149",
  border: "#30363d",
  diffHeader: "#8b949e",
};

export const MONOKAI_THEME: ICodeTheme = {
  name: "monokai",
  text: "#f8f8f2",
  background: "#272822",
  keyword: "#f92672",
  string: "#e6db74",
  comment: "#75715e",
  number: "#ae81ff",
  function: "#a6e22e",
  operator: "#f92672",
  punctuation: "#f8f8f2",
  boolean: "#ae81ff",
  builtin: "#66d9ef",
  variable: "#fd971f",
  gutterText: "#90908a",
  gutterBackground: "#1e1f1c",
  diffAddBackground: "#2e3b23",
  diffAddText: "#a6e22e",
  diffDeleteBackground: "#492429",
  diffDeleteText: "#f92672",
  border: "#3e3d32",
  diffHeader: "#75715e",
};

export const EXECUTIVE_PRINT_THEME: ICodeTheme = {
  name: "executive-print",
  text: "#1e293b",
  background: "#f8fafc",
  keyword: "#0f172a",
  string: "#334155",
  comment: "#64748b",
  number: "#0f172a",
  function: "#0f172a",
  operator: "#475569",
  punctuation: "#64748b",
  boolean: "#0f172a",
  builtin: "#0f172a",
  variable: "#1e293b",
  gutterText: "#94a3b8",
  gutterBackground: "#f1f5f9",
  diffAddBackground: "#f0fdf4",
  diffAddText: "#166534",
  diffDeleteBackground: "#fef2f2",
  diffDeleteText: "#991b1b",
  border: "#cbd5e1",
  diffHeader: "#64748b",
};

export const THEMES: Record<PresetThemeName, ICodeTheme> = {
  "github-light": GITHUB_LIGHT_THEME,
  "github-dark": GITHUB_DARK_THEME,
  monokai: MONOKAI_THEME,
  "executive-print": EXECUTIVE_PRINT_THEME,
};

/**
 * Resolves theme configuration from name or custom object.
 */
export const resolveTheme = (
  themeOption?: PresetThemeName | ICodeTheme,
  customThemes?: Record<string, Partial<ICodeTheme>>,
): ICodeTheme => {
  if (typeof themeOption === "object" && themeOption !== null) {
    return {
      ...GITHUB_LIGHT_THEME,
      ...themeOption,
    };
  }

  const themeKey = themeOption ?? "github-light";

  if (customThemes && themeKey in customThemes) {
    return {
      ...GITHUB_LIGHT_THEME,
      ...customThemes[themeKey],
      name: themeKey,
    };
  }

  if (themeKey in THEMES) {
    return THEMES[themeKey];
  }

  return GITHUB_LIGHT_THEME;
};
