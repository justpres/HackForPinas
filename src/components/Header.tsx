'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@iconify/react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@/lib/utils';

import Image from 'next/image';

export function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Events' },
    { href: '/news', label: 'News' },
    { href: '/submit', label: 'Submit' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-sm">
      <div className="h-0.5 animate-header-flow" />
      
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image
              src="/hackforPinasLogo.png"
              alt="HackForPinas Logo"
              width={220}
              height={55}
              className="object-contain rounded-md"
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-sm transition-colors hover:text-primary',
                  pathname === link.href
                    ? 'font-medium text-primary'
                    : 'text-muted-foreground'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Nav Toggle */}
          <button
            className="md:hidden p-2 -mr-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Icon
              icon={isMobileMenuOpen ? 'fluent:dismiss-16-regular' : 'fluent:navigation-16-regular'}
              width={20}
              className="text-foreground"
            />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t bg-background md:hidden overflow-hidden"
          >
            <nav className="container mx-auto flex flex-col px-4 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'py-3 text-base font-medium transition-colors',
                    pathname === link.href
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
