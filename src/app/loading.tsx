import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground animate-pulse">
      <Header />
      
      {/* 1:1 Hero Section Skeleton */}
      <div className="relative overflow-hidden bg-black/80 px-4 py-16 border-b border-border/10">
        <div className="container mx-auto flex max-w-3xl flex-col items-center text-center">
          {/* SplitFlap Title Placeholder */}
          <div className="h-10 sm:h-12 w-3/4 max-w-xl bg-muted/60 rounded-xl mb-6" />
          {/* Subtitle Placeholder */}
          <div className="h-5 w-5/6 max-w-lg bg-muted/40 rounded-md mb-8" />
          
          {/* 3 Stat Counter Boxes */}
          <div className="flex flex-wrap justify-center gap-6 sm:gap-12">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="rounded-lg bg-primary/10 p-3 h-12 w-12 bg-muted/50 rounded-lg" />
                <div className="h-7 w-12 bg-muted/60 rounded-md mt-1" />
                <div className="h-4 w-24 bg-muted/40 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Events Feed Section */}
      <main className="flex-1 py-8 max-w-7xl mx-auto px-4 w-full">
        {/* Scope Tabs & FilterBar Skeleton */}
        <div className="border-b bg-background/95 py-3 mb-8">
          {/* Scope Tabs */}
          <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1">
            <div className="h-8 w-24 bg-primary/40 rounded-md" />
            <div className="h-8 w-44 bg-muted/50 rounded-md" />
            <div className="h-8 w-36 bg-muted/50 rounded-md" />
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="h-10 w-full max-w-sm bg-muted/50 rounded-md" />
            <div className="hidden md:flex items-center gap-3">
              <div className="h-10 w-32 bg-muted/40 rounded-md" />
              <div className="h-10 w-28 bg-muted/40 rounded-md" />
              <div className="h-10 w-36 bg-muted/40 rounded-md" />
              <div className="h-10 w-28 bg-muted/40 rounded-md" />
            </div>
          </div>
          <div className="h-4 w-28 bg-muted/30 rounded mt-4" />
        </div>

        {/* 1:1 Event Cards Grid (6 cards matching EventCard layout) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex h-full flex-col overflow-hidden rounded-lg bg-card border border-border/40"
            >
              {/* Aspect Video Thumbnail */}
              <div className="relative aspect-video w-full bg-muted/60">
                {/* Top-Left Scope Badge */}
                <div className="absolute left-2 top-2 h-5 w-20 bg-muted/80 rounded-full" />
                {/* Top-Right Countdown Badge */}
                <div className="absolute right-2 top-2 h-5 w-16 bg-muted/80 rounded-full" />
              </div>

              {/* Card Content Area */}
              <div className="flex flex-1 flex-col gap-3 p-4">
                <div className="space-y-2">
                  {/* Event Title (2 lines) */}
                  <div className="h-5 w-11/12 bg-muted/70 rounded" />
                  <div className="h-5 w-3/4 bg-muted/60 rounded" />
                  {/* Organizer with verified icon */}
                  <div className="flex items-center gap-2 pt-1">
                    <div className="h-4 w-32 bg-muted/40 rounded" />
                    <div className="h-4 w-4 bg-muted/40 rounded-full" />
                  </div>
                </div>

                {/* Bottom Tags */}
                <div className="mt-auto pt-3 flex flex-wrap items-center gap-2">
                  <div className="h-6 w-36 bg-muted/50 rounded-sm" />
                  <div className="h-6 w-20 bg-muted/40 rounded-sm" />
                </div>
                {/* Last Verified date */}
                <div className="h-3 w-28 bg-muted/30 rounded pt-1" />
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
