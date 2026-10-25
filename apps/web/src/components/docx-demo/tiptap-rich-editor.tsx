"use client";

import { DocxExtension } from "@m2d/tiptap";
import { applyAllFixesToEditor, PromptShield } from "@promptshield/tiptap";
import { Markdown } from "@tiptap/markdown";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Code,
  FileDown,
  GitBranch,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  Quote,
  Redo,
  ShieldCheck,
  Strikethrough,
  Undo,
} from "lucide-react";
import mermaid from "mermaid";
import { useEffect, useMemo, useRef, useState } from "react";
import { CodeBlockLowlightMermaid } from "tiptap-extension-mermaid";
import { lowlight } from "./highlight";

const FRONTMATTER_REGEX =
  /^(---\r?\n[\s\S]*?\r?\n---|^\+\+\+\r?\n[\s\S]*?\r?\n\+\+\+)\r?\n?/;

const splitFrontmatter = (val: string) => {
  const match = val.match(FRONTMATTER_REGEX);
  if (!match) return { frontmatter: "", body: val };
  const frontmatter = match[0];
  const body = val.slice(frontmatter.length);
  return { frontmatter, body };
};

interface TiptapRichEditorProps {
  value: string;
  onChange: (value: string) => void;
  isActive?: boolean;
}

export const TiptapRichEditor = ({
  value,
  onChange,
  isActive = true,
}: TiptapRichEditorProps) => {
  const [cleanedCount, setCleanedCount] = useState(0);
  const initial = useMemo(() => splitFrontmatter(value), [value]);
  const frontmatterRef = useRef(initial.frontmatter);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: "neutral",
      securityLevel: "loose",
      fontFamily: "inherit",
    });
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        heading: { levels: [1, 2, 3] },
      }),
      CodeBlockLowlightMermaid.configure({
        lowlight,
        debounce: 300,
        classList: [
          "mermaid-container",
          "my-3",
          "p-3",
          "rounded-xl",
          "border",
          "border-border",
          "bg-card/60",
          "backdrop-blur-sm",
          "shadow-xs",
          "flex",
          "justify-center",
          "overflow-x-auto",
        ],
        mermaidConfig: {
          theme: "neutral",
        },
      }),
      Markdown.configure({
        markedOptions: {
          gfm: true,
        },
      }),
      PromptShield.configure({
        scanOnUpdate: true,
        scanOnPaste: true,
        debounceMs: 200,
        hoverUi: true,
      }),
      DocxExtension.configure({
        defaultFilename: "tiptap-export.docx",
      }),
    ],
    content: initial.body,
    contentType: "markdown",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[260px] max-h-[500px] overflow-y-auto p-5 leading-relaxed font-sans",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      const bodyMd = currentEditor.getMarkdown();
      const fm = frontmatterRef.current;
      const fullMd = fm ? `${fm.trimEnd()}\n\n${bodyMd.trimStart()}` : bodyMd;
      onChange(fullMd);
    },
  });

  // Keep editor content in sync when preset or external markdown changes
  useEffect(() => {
    if (!editor) return;
    const { frontmatter, body } = splitFrontmatter(value);
    frontmatterRef.current = frontmatter;
    if (!editor.isFocused) {
      const currentMd = editor.getMarkdown();
      if (body.trim() !== currentMd.trim()) {
        editor.commands.setContent(body, {
          contentType: "markdown",
          emitUpdate: false,
        });
      }
    }
  }, [value, editor]);

  // Ensure latest external markdown is loaded when this tab becomes active
  useEffect(() => {
    if (editor && isActive) {
      const { frontmatter, body } = splitFrontmatter(value);
      frontmatterRef.current = frontmatter;
      const currentMd = editor.getMarkdown();
      if (body.trim() !== currentMd.trim()) {
        editor.commands.setContent(body, {
          contentType: "markdown",
          emitUpdate: false,
        });
      }
    }
  }, [isActive, value, editor]);

  if (!editor) return null;

  const handleCleanThreats = () => {
    applyAllFixesToEditor(editor);
    setCleanedCount((prev) => prev + 1);
  };

  const handleInsertMermaid = () => {
    editor
      .chain()
      .focus()
      .insertContent(
        "\n```mermaid\ngraph TD\n  A[Start] --> B[Process]\n  B --> C[End]\n```\n",
        { contentType: "markdown" },
      )
      .run();
  };

  return (
    <div className="flex flex-col rounded-xl border border-border bg-background overflow-hidden">
      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 p-2 bg-muted/40 border-b border-border/60 text-xs">
        <div className="flex items-center flex-wrap gap-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded hover:bg-muted cursor-pointer ${
              editor.isActive("bold")
                ? "bg-primary/20 text-primary font-bold"
                : "text-muted-foreground"
            }`}
            title="Bold"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded hover:bg-muted cursor-pointer ${
              editor.isActive("italic")
                ? "bg-primary/20 text-primary italic"
                : "text-muted-foreground"
            }`}
            title="Italic"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-1.5 rounded hover:bg-muted cursor-pointer ${
              editor.isActive("strike")
                ? "bg-primary/20 text-primary"
                : "text-muted-foreground"
            }`}
            title="Strikethrough"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`p-1.5 rounded hover:bg-muted cursor-pointer ${
              editor.isActive("code")
                ? "bg-primary/20 text-primary"
                : "text-muted-foreground"
            }`}
            title="Inline Code"
          >
            <Code className="w-3.5 h-3.5" />
          </button>

          <span className="w-px h-4 bg-border/60 mx-1" />

          <button
            type="button"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            className={`p-1.5 rounded hover:bg-muted cursor-pointer ${
              editor.isActive("heading", { level: 1 })
                ? "bg-primary/20 text-primary font-bold"
                : "text-muted-foreground"
            }`}
            title="Heading 1"
          >
            <Heading1 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            className={`p-1.5 rounded hover:bg-muted cursor-pointer ${
              editor.isActive("heading", { level: 2 })
                ? "bg-primary/20 text-primary font-bold"
                : "text-muted-foreground"
            }`}
            title="Heading 2"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            className={`p-1.5 rounded hover:bg-muted cursor-pointer ${
              editor.isActive("heading", { level: 3 })
                ? "bg-primary/20 text-primary font-bold"
                : "text-muted-foreground"
            }`}
            title="Heading 3"
          >
            <Heading3 className="w-3.5 h-3.5" />
          </button>

          <span className="w-px h-4 bg-border/60 mx-1" />

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 rounded hover:bg-muted cursor-pointer ${
              editor.isActive("bulletList")
                ? "bg-primary/20 text-primary"
                : "text-muted-foreground"
            }`}
            title="Bullet List"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1.5 rounded hover:bg-muted cursor-pointer ${
              editor.isActive("orderedList")
                ? "bg-primary/20 text-primary"
                : "text-muted-foreground"
            }`}
            title="Numbered List"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-1.5 rounded hover:bg-muted cursor-pointer ${
              editor.isActive("blockquote")
                ? "bg-primary/20 text-primary"
                : "text-muted-foreground"
            }`}
            title="Blockquote"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>

          <span className="w-px h-4 bg-border/60 mx-1" />

          {/* Insert Mermaid Diagram */}
          <button
            type="button"
            onClick={handleInsertMermaid}
            className="flex items-center gap-1 p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-primary transition-colors cursor-pointer"
            title="Insert Mermaid Diagram"
          >
            <GitBranch className="w-3.5 h-3.5 text-primary" />
            <span className="text-[11px] font-medium hidden sm:inline">
              Mermaid
            </span>
          </button>

          <span className="w-px h-4 bg-border/60 mx-1" />

          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-1.5 rounded hover:bg-muted text-muted-foreground disabled:opacity-40 cursor-pointer"
            title="Undo"
          >
            <Undo className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-1.5 rounded hover:bg-muted text-muted-foreground disabled:opacity-40 cursor-pointer"
            title="Redo"
          >
            <Redo className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {/* PromptShield Security Action */}
          <button
            type="button"
            onClick={handleCleanThreats}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 transition-colors cursor-pointer"
            title="Clean Prompt Injection & Safety Threats"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Scan & Sanitize</span>
            {cleanedCount > 0 && (
              <span className="ml-1 px-1 rounded-full bg-emerald-500 text-white text-[9px]">
                {cleanedCount}
              </span>
            )}
          </button>

          {/* Tiptap Extension DOCX Export Action */}
          <button
            type="button"
            onClick={() => editor.commands.downloadDocx("tiptap-export.docx")}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-primary/10 text-primary hover:bg-primary/20 border border-primary/30 transition-colors cursor-pointer"
            title="Export directly to Word (.docx) using @m2d/tiptap"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Export DOCX</span>
          </button>
        </div>
      </div>

      {/* Frontmatter Metadata Preservation Pill */}
      {frontmatterRef.current && (
        <div className="mx-4 mt-3 px-3 py-1.5 rounded-lg border border-border/80 bg-muted/30 font-mono text-xs text-muted-foreground flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold text-foreground">
              Frontmatter Header Preserved
            </span>
            <span className="hidden sm:inline text-[11px] text-muted-foreground">
              (Metadata delimiter intact outside WYSIWYG text flow)
            </span>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-muted border border-border text-foreground">
            YAML / TOML
          </span>
        </div>
      )}

      {/* Editor Content Surface */}
      <EditorContent editor={editor} />
    </div>
  );
};
