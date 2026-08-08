import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/Header';
import ReviewQueue from '@/components/admin/ReviewQueue';
import { HackathonWithOrganizer } from '@/lib/types';

export default async function AdminDashboard() {
  const supabase = await createClient();

  const { data: pendingData } = await supabase
    .from('hackathons')
    .select('*, organizer:organizers(*)')
    .eq('status', 'pending_review')
    .order('created_at', { ascending: false });

  // Counts
  const { count: pendingCount } = await supabase
    .from('hackathons')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending_review');

  const { count: publishedCount } = await supabase
    .from('hackathons')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published');

  const { count: rejectedCount } = await supabase
    .from('hackathons')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'rejected');

  const pendingHackathons = (pendingData || []) as HackathonWithOrganizer[];

  return (
    <div className="flex flex-col min-h-screen bg-muted/20">
      <Header />
      <main className="flex-1 py-8 px-4 max-w-7xl mx-auto w-full">
        <h1 className="text-3xl font-bold mb-8">Review Queue</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card p-6 rounded-lg border shadow-sm">
            <div className="text-sm text-muted-foreground font-medium mb-2">Pending</div>
            <div className="text-3xl font-bold">{pendingCount || 0}</div>
          </div>
          <div className="bg-card p-6 rounded-lg border shadow-sm">
            <div className="text-sm text-muted-foreground font-medium mb-2">Published</div>
            <div className="text-3xl font-bold text-green-600">{publishedCount || 0}</div>
          </div>
          <div className="bg-card p-6 rounded-lg border shadow-sm">
            <div className="text-sm text-muted-foreground font-medium mb-2">Rejected</div>
            <div className="text-3xl font-bold text-red-600">{rejectedCount || 0}</div>
          </div>
        </div>

        <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
          <ReviewQueue hackathons={pendingHackathons} />
        </div>
      </main>
    </div>
  );
}
