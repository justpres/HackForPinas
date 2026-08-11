'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

type TocItem = {
  id: string;
  title: string;
  level: number;
};

export function DocsToc() {
  const pathname = usePathname();
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    const readHeadings = () => {
      const headings = [...document.querySelectorAll<HTMLElement>('article[data-docs-article] h2, article[data-docs-article] h3')]
        .filter((heading) => heading.id)
        .map((heading) => ({
          id: heading.id,
          title: heading.textContent ?? '',
          level: Number(heading.tagName.slice(1)),
        }));

      setItems(headings);
      setActiveId(headings[0]?.id ?? '');
    };

    const frame = window.requestAnimationFrame(readHeadings);
    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  useEffect(() => {
    if (!items.length) return;

    let frame = 0;
    const updateActiveHeading = () => {
      const closest = items
        .map((item) => document.getElementById(item.id))
        .filter((heading): heading is HTMLElement => Boolean(heading))
        .filter((heading) => heading.getBoundingClientRect().top <= 140)
        .at(-1);

      setActiveId(closest?.id ?? items[0].id);
      frame = 0;
    };
    const handleScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(updateActiveHeading);
    };

    updateActiveHeading();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [items]);

  if (!items.length) return null;

  return (
    <aside className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto border-l border-border/70 pl-5">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">On this page</p>
      <nav aria-label="On this page" className="space-y-1">
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={cn(
              'block border-l-2 py-1 text-sm transition-colors',
              item.level === 3 ? 'pl-4' : 'pl-3',
              activeId === item.id
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {item.title}
          </a>
        ))}
      </nav>
    </aside>
  );
}
