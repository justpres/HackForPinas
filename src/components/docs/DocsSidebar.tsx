'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import type { DocsNavigationItem } from '@/lib/docs';

type DocsSidebarProps = {
  items: DocsNavigationItem[];
  onItemClick?: () => void;
};

export function DocsSidebar({ items, onItemClick }: DocsSidebarProps) {
  const pathname = usePathname();
  const groups = useMemo(() => {
    const grouped = new Map<string, DocsNavigationItem[]>();

    for (const item of items) {
      grouped.set(item.category, [...(grouped.get(item.category) ?? []), item]);
    }

    return [...grouped.entries()];
  }, [items]);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  return (
    <nav aria-label="Documentation navigation" className="space-y-5">
      <div className="px-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Documentation
      </div>
      {groups.map(([category, categoryItems]) => {
        const isCollapsed = collapsed[category] ?? false;

        return (
          <section key={category}>
            <button
              type="button"
              onClick={() => setCollapsed((current) => ({ ...current, [category]: !isCollapsed }))}
              className="flex w-full items-center justify-between rounded-md px-2 py-1 text-left text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-foreground"
              aria-expanded={!isCollapsed}
            >
              {category}
              <Icon
                icon="fluent:chevron-down-16-regular"
                width={16}
                className={cn('transition-transform', isCollapsed && '-rotate-90')}
              />
            </button>
            {!isCollapsed && (
              <ul className="mt-1 space-y-1">
                {categoryItems.map((item) => {
                  const href = `/docs/${item.slug}`;
                  const active = pathname === href;

                  return (
                    <li key={item.slug}>
                      <Link
                        href={href}
                        onClick={onItemClick}
                        className={cn(
                          'block rounded-md border-l-2 px-3 py-2 text-sm transition-colors',
                          active
                            ? 'border-primary bg-primary/10 font-medium text-foreground shadow-[inset_8px_0_20px_-16px_var(--primary)]'
                            : 'border-transparent text-muted-foreground hover:bg-white/5 hover:text-foreground'
                        )}
                      >
                        {item.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        );
      })}
    </nav>
  );
}
