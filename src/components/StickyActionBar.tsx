'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Icon } from '@iconify/react';
import { CountdownBadge } from '@/components/CountdownBadge';
import { cn } from '@/lib/utils';

interface StickyActionBarProps {
  title: string;
  deadline: string;
  redirectUrl: string;
  /** The ID of the hero element to observe */
  heroRef: React.RefObject<HTMLDivElement | null>;
}

export function StickyActionBar({ title, deadline, redirectUrl, heroRef }: StickyActionBarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show the bar when hero is NOT intersecting (scrolled past)
        setIsVisible(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: '-64px 0px 0px 0px' } // offset for header height
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, [heroRef]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className={cn(
            'fixed top-[65px] left-0 right-0 z-30',
            'border-b bg-background/95 backdrop-blur-sm',
          )}
          style={{ boxShadow: 'var(--shadow-resting)' }}
          role="navigation"
          aria-label="Quick actions"
        >
          <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-2.5">
            <div className="flex min-w-0 items-center gap-3">
              <h2 className="truncate text-sm font-semibold">{title}</h2>
              <div className="hidden shrink-0 sm:block">
                <CountdownBadge deadline={deadline} />
              </div>
            </div>

            <a
              href={redirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'inline-flex shrink-0 items-center gap-2 rounded-md px-4 py-2',
                'bg-primary text-primary-foreground text-sm font-medium',
                'transition-colors hover:bg-primary/90',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
                'min-h-[44px]' // WCAG 2.5.8 target size
              )}
            >
              Register
              <Icon icon="fluent:open-16-regular" width={16} />
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
