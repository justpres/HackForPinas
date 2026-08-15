import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function EventDetailLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground animate-pulse">
      <Header />

      <main className="flex-1 pb-16">
        {/* ── Section 1: Full-Bleed Hero Banner Skeleton ── */}
        <div className="relative w-full overflow-hidden bg-muted/60 aspect-[21/9] min-h-[280px] max-h-[420px] md:aspect-[3/1]">
          <div className="container mx-auto px-4 h-full flex flex-col justify-between py-6">
            {/* Breadcrumb / Back Link */}
            <div className="h-6 w-36 bg-muted/80 rounded-md" />

            {/* Title & Badge */}
            <div className="space-y-3 max-w-2xl">
              <div className="h-6 w-28 bg-primary/40 rounded-full" />
              <div className="h-10 md:h-12 w-4/5 bg-muted/90 rounded-lg" />
              <div className="h-5 w-48 bg-muted/60 rounded" />
            </div>
          </div>
        </div>

        {/* ── Section 2: Metadata Island Grid Skeleton ── */}
        <div className="container mx-auto px-4 -mt-8 relative z-10">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-2 rounded-lg border bg-card/80 p-4 text-center h-24"
              >
                <div className="h-5 w-5 bg-muted/60 rounded-full" />
                <div className="h-3 w-16 bg-muted/40 rounded" />
                <div className="h-4 w-24 bg-muted/70 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* ── Section 3: 2-Column Content Layout Skeleton ── */}
        <div className="container mx-auto px-4 pt-10">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Left Column: Description, Organizer & FAQ */}
            <div className="lg:col-span-2 space-y-8">
              {/* Event Description Card */}
              <div className="rounded-xl border bg-card p-6 space-y-4">
                <div className="h-7 w-40 bg-muted/70 rounded-md" />
                <div className="space-y-2.5 pt-2">
                  <div className="h-4 w-full bg-muted/50 rounded" />
                  <div className="h-4 w-11/12 bg-muted/50 rounded" />
                  <div className="h-4 w-4/5 bg-muted/50 rounded" />
                  <div className="h-4 w-full bg-muted/40 rounded" />
                  <div className="h-4 w-2/3 bg-muted/40 rounded" />
                </div>
              </div>

              {/* Organizer Profile Card */}
              <div className="rounded-xl border bg-card p-6 space-y-3">
                <div className="h-6 w-44 bg-muted/60 rounded" />
                <div className="flex items-center gap-3 pt-2">
                  <div className="h-12 w-12 rounded-full bg-muted/60" />
                  <div className="space-y-2">
                    <div className="h-5 w-48 bg-muted/70 rounded" />
                    <div className="h-4 w-28 bg-muted/40 rounded" />
                  </div>
                </div>
              </div>

              {/* FAQ Accordion Skeleton */}
              <div className="rounded-xl border bg-card p-6 space-y-4">
                <div className="h-6 w-56 bg-muted/70 rounded" />
                <div className="space-y-3 pt-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 w-full bg-muted/40 rounded-lg" />
                  ))}
                </div>
              </div>
            </div>

            {/* Right Sidebar: Sticky Registration Card */}
            <div className="space-y-6">
              <div className="rounded-xl border bg-card p-6 space-y-5 sticky top-24">
                <div className="space-y-2">
                  <div className="h-4 w-28 bg-muted/40 rounded" />
                  <div className="h-8 w-40 bg-muted/80 rounded-lg" />
                </div>

                <div className="space-y-3 border-y py-4">
                  <div className="flex justify-between">
                    <div className="h-4 w-20 bg-muted/40 rounded" />
                    <div className="h-4 w-24 bg-muted/60 rounded" />
                  </div>
                  <div className="flex justify-between">
                    <div className="h-4 w-20 bg-muted/40 rounded" />
                    <div className="h-4 w-24 bg-muted/60 rounded" />
                  </div>
                </div>

                <div className="h-12 w-full bg-primary/40 rounded-lg" />
                <div className="h-3 w-4/5 mx-auto bg-muted/30 rounded" />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
