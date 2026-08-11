'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Icon } from '@iconify/react';
import type { DocsNavigationItem } from '@/lib/docs';
import { DocsSearch } from './DocsSearch';

type DocsHeaderProps = {
  items: DocsNavigationItem[];
  onMenuClick: () => void;
};

export function DocsHeader({ items, onMenuClick }: DocsHeaderProps) {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const activeItem = useMemo(
    () => items.find((item) => pathname === `/docs/${item.slug}`),
    [items, pathname]
  );

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen(true);
      }

      if (event.key === 'Escape') setSearchOpen(false);
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header className="flex items-center justify-between gap-4 border-b border-border/70 pb-4">
        <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
          <button
            type="button"
            onClick={onMenuClick}
            className="rounded-md p-2 text-foreground hover:bg-accent lg:hidden"
            aria-label="Open documentation navigation"
          >
            <Icon icon="fluent:navigation-20-regular" width={20} />
          </button>
          <span>Docs</span>
          {activeItem && (
            <>
              <Icon icon="fluent:chevron-right-16-regular" width={16} />
              <span className="truncate font-medium text-foreground">{activeItem.title}</span>
            </>
          )}
        </div>
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-border bg-card/70 px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-white/20 hover:text-foreground"
          aria-label="Search documentation"
        >
          <Icon icon="fluent:search-20-regular" width={17} />
          <span className="hidden sm:inline">Search docs</span>
          <kbd className="rounded border border-border px-1.5 py-0.5 text-[10px]">Ctrl K</kbd>
        </button>
      </header>
      <DocsSearch items={items} open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
