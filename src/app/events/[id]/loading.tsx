import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function EventDetailLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground animate-pulse">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 w-full">
        {/* Back button skeleton */}
        <div className="h-8 w-24 bg-muted/60 rounded-md mb-6" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main content column */}
          <div className="md:col-span-2 space-y-6">
            <div className="h-80 w-full bg-muted/70 rounded-xl" />
            <div className="space-y-3">
              <div className="h-5 w-32 bg-muted/50 rounded" />
              <div className="h-10 w-4/5 bg-muted/80 rounded" />
              <div className="h-4 w-full bg-muted/40 rounded" />
              <div className="h-4 w-5/6 bg-muted/40 rounded" />
              <div className="h-4 w-2/3 bg-muted/40 rounded" />
            </div>
          </div>

          {/* Sidebar column */}
          <div className="space-y-4">
            <div className="p-6 rounded-xl border bg-card/60 space-y-4">
              <div className="h-6 w-32 bg-muted/60 rounded" />
              <div className="space-y-3 pt-2">
                <div className="h-4 w-full bg-muted/40 rounded" />
                <div className="h-4 w-3/4 bg-muted/40 rounded" />
                <div className="h-4 w-1/2 bg-muted/40 rounded" />
              </div>
              <div className="h-11 w-full bg-blue-600/40 rounded-lg pt-4" />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
