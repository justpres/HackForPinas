'use client';

import { useState } from 'react';
import { DocsSidebar } from '@/components/docs/DocsSidebar';
import { DocsHeader } from '@/components/docs/DocsHeader';

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background text-foreground flex flex-col">
      <div className="flex-1 flex w-full max-w-7xl mx-auto px-4 md:px-8 gap-8 relative">
        {/* Desktop Sidebar (Sticky, Left) */}
        <aside className="hidden md:block w-60 shrink-0 border-r border-border/10 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto py-8 pr-4 scrollbar-thin">
          <DocsSidebar />
        </aside>

        {/* Mobile Sidebar Back-overlay */}
        {isMobileOpen && (
          <div 
            className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-[1px]" 
            onClick={() => setIsMobileOpen(false)} 
          />
        )}
        
        {/* Mobile Sidebar (Drawer, Slides from left) */}
        <div
          className={`md:hidden fixed top-16 bottom-0 left-0 w-64 z-50 bg-background/98 border-r border-border/10 p-6 overflow-y-auto transition-transform duration-200 ease-out transform ${
            isMobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <DocsSidebar onItemClick={() => setIsMobileOpen(false)} />
        </div>

        {/* Main Article Content & TOC Container */}
        <div className="flex-1 min-w-0 flex flex-col py-8">
          <DocsHeader onMenuClick={() => setIsMobileOpen(true)} />
          <div className="flex-1 flex gap-8 mt-6">
            <main className="flex-1 min-w-0">
              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
