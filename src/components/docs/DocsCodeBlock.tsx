'use client';

import { type ReactNode, useRef } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';

type DocsCodeBlockProps = {
  children: ReactNode;
};

export function DocsCodeBlock({ children }: DocsCodeBlockProps) {
  const codeRef = useRef<HTMLPreElement>(null);
  const codeElement = children as { props?: { className?: string } };
  const language = codeElement.props?.className?.match(/language-([\w-]+)/)?.[1] ?? 'text';

  async function copyCode() {
    const code = codeRef.current?.innerText;

    if (!code) return;

    try {
      await navigator.clipboard.writeText(code);
      toast.success('Code copied to clipboard');
    } catch {
      toast.error('Could not copy code');
    }
  }

  return (
    <div className="docs-code-block group not-prose">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2 text-xs text-muted-foreground">
        <span className="font-mono uppercase tracking-[0.16em]">{language}</span>
        <button
          type="button"
          onClick={copyCode}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 transition-colors hover:bg-white/10 hover:text-foreground"
          aria-label="Copy code to clipboard"
        >
          <Icon icon="fluent:copy-16-regular" width={15} />
          Copy
        </button>
      </div>
      <pre ref={codeRef} className="overflow-x-auto p-4 text-sm leading-6">
        {children}
      </pre>
    </div>
  );
}
