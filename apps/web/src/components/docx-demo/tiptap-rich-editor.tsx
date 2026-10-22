"use client";

import { applyAllFixesToEditor, PromptShield } from "@promptshield/tiptap";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Italic,
  List,
  ListOrdered,
  Quote,
  Redo,
  ShieldCheck,
  Strikethrough,
  Undo,
} from "lucide-react";
import { useState } from "react";

const INITIAL_PROSE_SAMPLE = `<h2>Tiptap Rich Text Editor</h2><p>This is a live WYSIWYG editor integrated with <strong>@promptshield/tiptap</strong>.</p><p>Try writing, formatting, or testing prompt injection phrases to see real-time security scanning.</p><blockquote>"OpenXML formatting that is secure, universal, and accessible."</blockquote>`;

export const TiptapRichEditor = () => {
  const [cleanedCount, setCleanedCount] = useState(0);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2] },
      }),
      PromptShield.configure({
        scanOnUpdate: true,
        scanOnPaste: true,
        debounceMs: 200,
        hoverUi: true,
      }),
    ],
    content: INITIAL_PROSE_SAMPLE,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[240px] max-h-[460px] overflow-y-auto p-5 leading-relaxed",
      },
    },
  });

  if (!editor) return null;

  const handleCleanThreats = () => {
    applyAllFixesToEditor(editor);
    setCleanedCount((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col rounded-xl border border-border bg-background overflow-hidden">
      {/* Toolbar */}
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

        {/* PromptShield Security Action */}
        <button
          type="button"
          onClick={handleCleanThreats}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 transition-colors cursor-pointer"
          title="Clean Prompt Threats"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Scan & Sanitize</span>
          {cleanedCount > 0 && (
            <span className="ml-1 px-1 rounded-full bg-emerald-500 text-white text-[9px]">
              {cleanedCount}
            </span>
          )}
        </button>
      </div>

      {/* Editor Content Surface */}
      <EditorContent editor={editor} />
    </div>
  );
};
