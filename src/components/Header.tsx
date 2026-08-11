'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@iconify/react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@/lib/utils';

import Image from 'next/image';
import { useChat } from './ChatProvider';

export function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isOpen, setIsOpen, unreadCount } = useChat();

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

          <div className="flex items-center gap-4">
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

            {/* Chat Toggle Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="relative p-2 rounded-md hover:bg-accent/40 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="Open Chat Lobby"
              aria-label="Open Chat Lobby"
            >
              <Icon icon="fluent:chat-24-regular" width={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-bold text-white border border-background">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Mobile Nav Toggle */}
            <button
              className="md:hidden p-2"
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
