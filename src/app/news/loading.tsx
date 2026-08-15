import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function NewsLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground animate-pulse">
      <Header />

      <main id="main-content" className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* 1:1 News Header Skeleton */}
          <header className="mb-10 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/40 h-6 w-48 mb-3" />
            <div className="h-10 md:h-12 w-3/4 max-w-lg bg-muted/70 rounded-lg mb-3" />
            <div className="h-5 w-5/6 max-w-2xl bg-muted/40 rounded-md" />
          </header>

          {/* Search & Category Pills Skeleton */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="h-10 w-full max-w-md bg-muted/50 rounded-lg" />
            <div className="flex items-center gap-2 overflow-x-auto">
              <div className="h-9 w-16 bg-primary/40 rounded-lg" />
              <div className="h-9 w-28 bg-muted/40 rounded-lg" />
              <div className="h-9 w-28 bg-muted/40 rounded-lg" />
              <div className="h-9 w-24 bg-muted/40 rounded-lg" />
            </div>
          </div>

          {/* 1:1 News Timeline Cards */}
          <div className="space-y-6 max-w-3xl">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-4 w-full p-2">
                {/* Left Side: Avatar & Timeline Spine */}
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-10 h-10 rounded-full bg-muted/80 border border-muted/20" />
                  {i < 3 && <div className="w-0.5 bg-muted/30 flex-1 my-2 min-h-[90px]" />}
                </div>

                {/* Right Side: Contents */}
                <div className="flex-1 pb-8 flex flex-col gap-3">
                  {/* Metadata Header */}
                  <div className="flex items-center gap-2">
                    <div className="h-4 bg-muted/70 rounded w-20" />
                    <span className="text-muted/40 text-xs">•</span>
                    <div className="h-4 bg-muted/60 rounded w-24" />
                    <span className="text-muted/40 text-xs">•</span>
                    <div className="h-4 bg-muted/50 rounded w-16" />
                  </div>

                  {/* Headline */}
                  <div className="space-y-1.5">
                    <div className="h-6 bg-muted/80 rounded w-11/12" />
                    <div className="h-6 bg-muted/70 rounded w-2/3" />
                  </div>

                  {/* Excerpt */}
                  <div className="space-y-2 pt-1">
                    <div className="h-4 bg-muted/60 rounded w-full" />
                    <div className="h-4 bg-muted/50 rounded w-4/5" />
                  </div>

                  {/* Social Action Footer */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="h-8 bg-muted/50 rounded-lg w-24" />
                    <div className="flex gap-2">
                      <div className="h-8 bg-muted/40 rounded-lg w-8" />
                      <div className="h-8 bg-muted/40 rounded-lg w-8" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
