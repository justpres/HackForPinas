import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground animate-pulse">
      <Header />
      
      <div className="w-full border-b bg-card/50 py-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center text-center space-y-4">
          <div className="h-10 w-64 md:w-96 bg-muted/60 rounded-lg" />
          <div className="h-5 w-48 md:w-80 bg-muted/40 rounded-md" />
          <div className="flex gap-4 pt-4">
            <div className="h-12 w-28 bg-muted/50 rounded-lg" />
            <div className="h-12 w-28 bg-muted/50 rounded-lg" />
            <div className="h-12 w-28 bg-muted/50 rounded-lg" />
          </div>
        </div>
      </div>

      <main className="flex-1 py-8 max-w-7xl mx-auto px-4 w-full">
        {/* Search & filter bar skeleton */}
        <div className="h-12 w-full bg-muted/40 rounded-lg mb-8" />

        {/* Event cards grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col rounded-xl border bg-card/60 overflow-hidden shadow-xs h-96 p-4 space-y-4"
            >
              <div className="h-44 w-full bg-muted/60 rounded-lg" />
              <div className="space-y-2">
                <div className="h-4 w-24 bg-muted/50 rounded" />
                <div className="h-6 w-3/4 bg-muted/70 rounded" />
                <div className="h-4 w-full bg-muted/40 rounded" />
              </div>
              <div className="mt-auto pt-4 border-t flex justify-between items-center">
                <div className="h-4 w-20 bg-muted/40 rounded" />
                <div className="h-8 w-24 bg-muted/50 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
