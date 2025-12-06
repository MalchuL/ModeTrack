import fs from "fs/promises";
import path from "path";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Button } from "@/components/ui/button";

async function loadDocumentation() {
  const docPath = path.join(process.cwd(), "public", "docs", "usage.md");
  return fs.readFile(docPath, "utf-8");
}

export default async function DocumentationPage() {
  const markdown = await loadDocumentation();

  return (
    <main className="container max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Documentation</h1>
      </div>

      <article className="neu-surface-soft rounded-2xl p-6 shadow-[var(--shadow-soft)] border border-transparent">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ node, ...props }) => (
              <h1 className="text-3xl font-bold mb-4" {...props} />
            ),
            h2: ({ node, ...props }) => (
              <h2 className="text-2xl font-semibold mt-6 mb-3" {...props} />
            ),
            h3: ({ node, ...props }) => (
              <h3 className="text-xl font-semibold mt-4 mb-2" {...props} />
            ),
            p: ({ node, ...props }) => (
              <p className="leading-relaxed text-muted-foreground mb-4" {...props} />
            ),
            ul: ({ node, ...props }) => (
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground" {...props} />
            ),
            li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
            a: ({ node, ...props }) => (
              <a className="text-primary underline-offset-4 hover:underline" {...props} />
            ),
            blockquote: ({ node, ...props }) => (
              <blockquote
                className="border-l-4 border-primary/60 bg-primary/5 px-4 py-2 italic rounded-r-lg text-muted-foreground"
                {...props}
              />
            ),
            code: ({ node, inline, ...props }) =>
              inline ? (
                <code
                  className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono text-foreground"
                  {...props}
                />
              ) : (
                <code className="block rounded bg-muted p-3 text-sm font-mono text-foreground" {...props} />
              ),
          }}
        >
          {markdown}
        </ReactMarkdown>
      </article>
    </main>
  );
}
