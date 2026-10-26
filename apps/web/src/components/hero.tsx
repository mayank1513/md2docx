"use client";

import { ArrowRight, Play } from "lucide-react";
import Link from "next/link";
import { CliTerminal } from "./cli-terminal";
import { Button } from "./ui/button";

const Github = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <title>GitHub</title>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export const Hero = () => {
  const handleScrollToEcosystem = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target =
      document.getElementById("ecosystem") ||
      document.getElementById("modular-ecosystem");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.pushState(null, "", "#ecosystem");
    }
  };

  return (
    <section className="relative overflow-hidden bg-background pt-24 pb-32">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="container relative z-10 mx-auto px-4 text-center">
        <Link
          href="/#ecosystem"
          scroll={false}
          onClick={handleScrollToEcosystem}
          className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-sm font-medium text-primary mb-8 shadow-xs hover:bg-primary/15 transition-colors cursor-pointer"
        >
          <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
          🚀 Md2Docx — Pluggable Engine with Rich Official Plugin Ecosystem
        </Link>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground mb-6">
          Markdown to Word <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 dark:from-blue-400 dark:via-indigo-400 dark:to-cyan-300">
            Native, Modular, Extensible
          </span>
        </h1>
        <p className="mx-auto max-w-5xl text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed">
          Convert Markdown into native, editable Word (.docx) documents in
          browsers or Node.js. Modular by design — cherry-pick{" "}
          <Link
            href="/#ecosystem"
            scroll={false}
            onClick={handleScrollToEcosystem}
            className="text-foreground underline decoration-primary/50 underline-offset-4 hover:decoration-primary font-medium transition-colors cursor-pointer"
          >
            official plugins
          </Link>
          , or{" "}
          <Link
            href="/docs/plugin-authoring"
            className="text-foreground underline decoration-primary/50 underline-offset-4 hover:decoration-primary font-medium transition-colors"
          >
            easily author your own
          </Link>
          .
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Button
            size="lg"
            className="w-full sm:w-auto font-semibold shadow-md"
            asChild
          >
            <Link href="/playground">
              <Play className="mr-2 h-4 w-4 fill-current" />
              Launch Live Playground
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full sm:w-auto font-semibold"
            asChild
          >
            <Link href="/docs">
              Documentation
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="ghost"
            className="w-full sm:w-auto font-semibold text-muted-foreground hover:text-foreground"
            asChild
          >
            <Link
              href="https://github.com/md2docx/md2docx"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="mr-2 h-4 w-4" />
              GitHub
            </Link>
          </Button>
        </div>

        {/* CLI Terminal Pill */}
        <CliTerminal />
      </div>
    </section>
  );
};
