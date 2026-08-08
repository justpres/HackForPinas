'use client';

import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center py-20 px-4">
        <Icon 
          icon="fluent:document-dismiss-24-regular" 
          className="text-muted-foreground w-16 h-16 mb-6" 
        />
        <h1 className="text-2xl font-bold mb-2">Page not found</h1>
        <p className="text-muted-foreground mb-8 text-center">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link href="/">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            Back to Events
          </Button>
        </Link>
      </main>
      <Footer />
    </div>
  );
}
