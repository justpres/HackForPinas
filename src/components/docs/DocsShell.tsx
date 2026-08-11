'use client';

import { useState, type ReactNode } from 'react';
import type { DocsNavigationItem } from '@/lib/docs';
import { DocsHeader } from './DocsHeader';
import { DocsSidebar } from './DocsSidebar';
import { DocsToc } from './DocsToc';

type DocsShellProps = {
  items: DocsNavigationItem[];
  children: ReactNode;
};

export function DocsShell({ items, children }: DocsShellProps) {
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background text-foreground">
      {mobileNavigationOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[1px] lg:hidden"
          onClick={() => setMobileNavigationOpen(false)}
          aria-label="Close documentation navigation"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto border-r border-white/10 bg-background/95 p-6 pt-24 backdrop-blur-xl transition-transform lg:hidden ${
          mobileNavigationOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <DocsSidebar items={items} onItemClick={() => setMobileNavigationOpen(false)} />
      </aside>
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 px-4 py-8 md:px-8 lg:grid-cols-[14rem_minmax(0,1fr)] xl:grid-cols-[14rem_minmax(0,1fr)_12rem]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-xl border border-white/10 bg-card/35 p-4 backdrop-blur-xl">
            <DocsSidebar items={items} />
          </div>
        </aside>
        <div className="min-w-0">
          <DocsHeader items={items} onMenuClick={() => setMobileNavigationOpen(true)} />
          <main className="mt-8 min-w-0">{children}</main>
        </div>
        <div className="hidden xl:block">
          <DocsToc />
        </div>
      </div>
    </div>
  );
}
