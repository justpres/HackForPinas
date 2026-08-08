'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';

interface Props {
  hackathonId: string;
  currentStatus: string;
}

export default function ReviewActions({ hackathonId, currentStatus }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');

  const supabase = createClient();

  const handleAction = async (newStatus: 'published' | 'rejected') => {
    if (!confirm(`Are you sure you want to ${newStatus === 'published' ? 'approve' : 'reject'} this submission?`)) {
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase
        .from('hackathons')
        .update({ status: newStatus })
        .eq('id', hackathonId);

      if (updateError) throw updateError;

      // Log action
      await supabase.from('audit_logs').insert({
        action: newStatus === 'published' ? 'approved' : 'rejected',
        entity_type: 'hackathon',
        entity_id: hackathonId,
        details: { notes }
      });

      toast.success(`Event successfully ${newStatus === 'published' ? 'approved' : 'rejected'}`);
      router.refresh();
      router.push('/admin');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update event status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card border rounded-lg p-6 shadow-sm sticky top-6">
      <h2 className="text-lg font-semibold mb-4">Review Actions</h2>
      
      {currentStatus === 'pending_review' ? (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Internal Notes (Optional)</label>
            <Textarea 
              placeholder="Reason for rejection or internal notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none h-24"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <Button 
              onClick={() => handleAction('published')} 
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <Icon icon="fluent:checkmark-16-regular" className="mr-2" />
              Approve & Publish
            </Button>
            <Button 
              onClick={() => handleAction('rejected')} 
              disabled={loading}
              variant="destructive"
              className="w-full"
            >
              <Icon icon="fluent:dismiss-16-regular" className="mr-2" />
              Reject Submission
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center p-4 bg-muted/50 rounded-md">
          <p className="text-sm text-muted-foreground">
            This event has already been 
            <strong className="mx-1 text-foreground">{currentStatus}</strong>
          </p>
        </div>
      )}
    </div>
  );
}
