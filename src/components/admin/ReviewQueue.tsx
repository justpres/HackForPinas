'use client';

import { HackathonWithOrganizer } from '@/lib/types';
import { format } from 'date-fns';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';

export default function ReviewQueue({ hackathons }: { hackathons: HackathonWithOrganizer[] }) {
  if (hackathons.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
          <Icon icon="fluent:checkmark-24-regular" className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-medium">No pending submissions</h3>
        <p className="text-muted-foreground">You're all caught up!</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Organizer</TableHead>
          <TableHead>Source</TableHead>
          <TableHead>Region</TableHead>
          <TableHead>Deadline</TableHead>
          <TableHead>Submitted</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {hackathons.map((h) => (
          <TableRow key={h.id}>
            <TableCell className="font-medium max-w-[200px] truncate" title={h.title}>
              {h.title}
            </TableCell>
            <TableCell className="max-w-[150px] truncate" title={h.organizer?.name}>
              {h.organizer?.name}
            </TableCell>
            <TableCell className="capitalize">{h.source_type}</TableCell>
            <TableCell className="capitalize">{h.region}</TableCell>
            <TableCell>
              {h.deadline ? format(new Date(h.deadline), 'MMM d, yyyy') : 'N/A'}
            </TableCell>
            <TableCell>
              {format(new Date(h.created_at), 'MMM d, yyyy')}
            </TableCell>
            <TableCell className="text-right">
              <Link href={`/admin/review/${h.id}`}>
                <Button variant="outline" size="sm">Review</Button>
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
