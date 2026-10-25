"use client";

import { Check, Copy, Terminal } from "lucide-react";
import { useState } from "react";

const COMMANDS = [
  { pm: "npx", cmd: "npx @m2d/cli report.md -o report.docx" },
  { pm: "pnpm", cmd: "pnpm dlx @m2d/cli report.md -o report.docx" },
  { pm: "bunx", cmd: "bunx @m2d/cli report.md -o report.docx" },
];

export const CliTerminal = () => {
  const [activePm, setActivePm] = useState("npx");
  const [copied, setCopied] = useState(false);

  const current = COMMANDS.find((c) => c.pm === activePm) ?? COMMANDS[0];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(current.cmd);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore clipboard error
    }
  };

  return (
    <div className="mx-auto mt-12 max-w-xl rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm shadow-lg overflow-hidden text-left">
      <div className="flex items-center justify-between border-b border-border/60 bg-muted/40 px-3.5 py-2 text-xs">
        <div className="flex items-center gap-1.5">
          <Terminal className="h-3.5 w-3.5 text-primary" />
          <span className="font-semibold text-foreground">Zero-Config CLI</span>
          <span className="text-muted-foreground hidden sm:inline">
            — Instant Document Compilation
          </span>
        </div>
        <div className="flex items-center gap-1">
          {COMMANDS.map((c) => (
            <button
              key={c.pm}
              type="button"
              onClick={() => setActivePm(c.pm)}
              className={`rounded px-2 py-0.5 text-[11px] font-mono transition-colors cursor-pointer ${
                activePm === c.pm
                  ? "bg-primary text-primary-foreground font-bold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {c.pm}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between p-3.5 font-mono text-xs sm:text-sm bg-background/50">
        <div className="flex items-center gap-2 overflow-x-auto text-foreground pr-2">
          <span className="text-primary font-bold select-none">$</span>
          <span>{current.cmd}</span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="ml-2 shrink-0 rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          title="Copy command"
        >
          {copied ? (
            <Check className="h-4 w-4 text-emerald-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
};
