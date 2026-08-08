import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/Header';
import ReviewActions from '@/components/admin/ReviewActions';
import { HackathonWithOrganizer } from '@/lib/types';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Icon } from '@iconify/react';

export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from('hackathons')
    .select('*, organizer:organizers(*)')
    .eq('id', id)
    .single();

  if (!data) {
    notFound();
  }

  const event = data as HackathonWithOrganizer;

  return (
    <div className="flex flex-col min-h-screen bg-muted/20">
      <Header />
      <main className="flex-1 py-8 px-4 max-w-5xl mx-auto w-full">
        <div className="mb-6">
          <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 w-fit">
            <Icon icon="fluent:arrow-left-16-regular" />
            Back to Queue
          </Link>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold">Review: {event.title}</h1>
          <Badge variant={event.status === 'published' ? 'default' : event.status === 'rejected' ? 'destructive' : 'secondary'}>
            {event.status}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card border rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Event Details</h2>
              <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                <div>
                  <span className="text-muted-foreground block">Organizer</span>
                  <span className="font-medium">{event.organizer?.name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Organizer Type</span>
                  <span className="font-medium capitalize">{event.organizer?.organizer_type}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Region</span>
                  <span className="font-medium capitalize">{event.region}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Format</span>
                  <span className="font-medium capitalize">{event.format}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Deadline</span>
                  <span className="font-medium">{event.deadline ? format(new Date(event.deadline), 'PP') : 'N/A'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Dates</span>
                  <span className="font-medium">
                    {event.event_start ? format(new Date(event.event_start), 'PP') : 'TBA'} - {event.event_end ? format(new Date(event.event_end), 'PP') : 'TBA'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-muted-foreground block mb-2 text-sm">Description</span>
                <div className="p-4 bg-muted/50 rounded-md whitespace-pre-wrap text-sm">
                  {event.description}
                </div>
              </div>
            </div>

            <div className="bg-card border rounded-lg p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-semibold">Links & Media</h2>
              <div>
                <span className="text-sm text-muted-foreground block mb-1">Redirect URL (Registration)</span>
                <a href={event.redirect_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm break-all">
                  {event.redirect_url}
                </a>
              </div>
              {event.source_url && (
                <div>
                  <span className="text-sm text-muted-foreground block mb-1">Source URL</span>
                  <a href={event.source_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm break-all">
                    {event.source_url}
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <ReviewActions hackathonId={event.id} currentStatus={event.status} />
          </div>
        </div>
      </main>
    </div>
  );
}
