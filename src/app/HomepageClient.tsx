'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Icon } from '@iconify/react';
import { HackathonWithOrganizer, FilterState } from '@/lib/types';
import { FilterBar } from '@/components/FilterBar';
import { EventCard } from '@/components/EventCard';

interface Props {
  events: HackathonWithOrganizer[];
}

export default function HomepageClient({ events }: Props) {
  const [filters, setFilters] = useState<FilterState>({
    region: 'all',
    format: 'all',
    organizer_type: 'all',
    sort: 'deadline',
    search: '',
  });

  const filteredEvents = events.filter((event) => {
    // Search
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matchTitle = event.title.toLowerCase().includes(q);
      const matchOrg = event.organizer?.name?.toLowerCase().includes(q);
      const matchDesc = event.description?.toLowerCase().includes(q);
      if (!matchTitle && !matchOrg && !matchDesc) return false;
    }

    // Region
    if (filters.region !== 'all' && event.region !== filters.region) return false;

    // Format
    if (filters.format !== 'all' && event.format !== filters.format) return false;

    // Organizer Type
    if (filters.organizer_type !== 'all' && event.organizer?.organizer_type !== filters.organizer_type) return false;

    return true;
  }).sort((a, b) => {
    if (filters.sort === 'deadline') {
      const aDate = a.deadline ? new Date(a.deadline).getTime() : Infinity;
      const bDate = b.deadline ? new Date(b.deadline).getTime() : Infinity;
      return aDate - bDate;
    } else {
      const aDate = new Date(a.created_at).getTime();
      const bDate = new Date(b.created_at).getTime();
      return bDate - aDate;
    }
  });

  const clearFilters = () => {
    setFilters({
      region: 'all',
      format: 'all',
      organizer_type: 'all',
      sort: 'deadline',
      search: '',
    });
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      <FilterBar 
        filters={filters} 
        onChange={(next) => setFilters(prev => ({ ...prev, ...next }))} 
        resultCount={filteredEvents.length} 
      />
      
      {filteredEvents.length > 0 ? (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8"
        >
          {filteredEvents.map((event) => (
            <motion.div key={event.id} variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
              <EventCard event={event} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Icon icon="fluent:search-dismiss-24-regular" className="text-muted-foreground w-12 h-12 mb-4" />
          <h2 className="text-xl font-semibold mb-2">No events match your filters</h2>
          <p className="text-muted-foreground mb-6">Try adjusting your filters or search terms.</p>
          <button 
            onClick={clearFilters}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
