'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import { Icon } from '@iconify/react';
import type { DocsNavigationItem } from '@/lib/docs';

type DocsSearchProps = {
  items: DocsNavigationItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DocsSearch({ items, open, onOpenChange }: DocsSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');

  if (!open) return null;

  function setOpen(nextOpen: boolean) {
    if (!nextOpen) setQuery('');
    onOpenChange(nextOpen);
  }

  function selectItem(slug: string) {
    setOpen(false);
    router.push(`/docs/${slug}`);
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center bg-black/70 px-4 pt-[12vh] backdrop-blur-sm"
      role="presentation"
      onMouseDown={() => setOpen(false)}
    >
      <Command
        label="Search documentation"
        className="w-full max-w-xl overflow-hidden rounded-xl border border-white/10 bg-card shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Icon icon="fluent:search-20-regular" width={20} className="text-muted-foreground" />
          <Command.Input
            autoFocus
            value={query}
            onValueChange={setQuery}
            placeholder="Search documentation..."
            className="h-14 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">ESC</kbd>
        </div>
        <Command.List className="max-h-[50vh] overflow-y-auto p-2">
          <Command.Empty className="px-3 py-8 text-center text-sm text-muted-foreground">
            No documentation found.
          </Command.Empty>
          {items.map((item) => (
            <Command.Item
              key={item.slug}
              value={`${item.title} ${item.description} ${item.category}`}
              onSelect={() => selectItem(item.slug)}
              className="flex cursor-pointer flex-col gap-1 rounded-lg px-3 py-3 aria-selected:bg-accent"
            >
              <span className="text-sm font-medium">{item.title}</span>
              <span className="text-xs text-muted-foreground">{item.description}</span>
            </Command.Item>
          ))}
        </Command.List>
      </Command>
    </div>
  );
}
