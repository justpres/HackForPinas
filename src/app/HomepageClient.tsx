'use client';

import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Icon } from '@iconify/react';
import { HackathonWithOrganizer, FilterState } from '@/lib/types';
import { FilterBar } from '@/components/FilterBar';
import { EventCard } from '@/components/EventCard';
import { isPhilippineHackathon } from '@/lib/constants';

interface Props {
  events: HackathonWithOrganizer[];
}

export default function HomepageClient({ events }: Props) {
  const [filters, setFilters] = useState<FilterState>({
    scope: 'all',
    region: 'all',
    format: 'all',
    organizer_type: 'all',
    sort: 'deadline',
    search: '',
  });

  const filteredAndSortedEvents = useMemo(() => {
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;

    return events.filter((event) => {
      const isPh = isPhilippineHackathon(event);

      // Scope Filter (All vs Philippines Only vs International / Foreign Only)
      if (filters.scope === 'philippines' && !isPh) return false;
      if (filters.scope === 'international' && isPh) return false;

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
      const isAPh = isPhilippineHackathon(a);
      const isBPh = isPhilippineHackathon(b);

      const aDeadline = a.deadline ? new Date(a.deadline).getTime() : 0;
      const bDeadline = b.deadline ? new Date(b.deadline).getTime() : 0;

      const aEnd = a.event_end ? new Date(a.event_end).getTime() : aDeadline;
      const bEnd = b.event_end ? new Date(b.event_end).getTime() : bDeadline;

      // Check if event is ongoing or upcoming (has not ended)
      const isAActive = (aEnd || aDeadline) >= (now - oneDayMs);
      const isBActive = (bEnd || bDeadline) >= (now - oneDayMs);

      // Tier Calculation:
      // Tier 1: Philippine Active / Upcoming (Ongoing & Upcoming PH Hackathons/Tech Events)
      // Tier 2: Foreign/Global Active / Upcoming (Ongoing & Upcoming Global Hackathons)
      // Tier 3: Philippine Past / Concluded
      // Tier 4: Foreign/Global Past / Concluded
      const getTier = (isPh: boolean, isActive: boolean) => {
        if (isPh && isActive) return 1;
        if (!isPh && isActive) return 2;
        if (isPh && !isActive) return 3;
        return 4;
      };

      const tierA = getTier(isAPh, isAActive);
      const tierB = getTier(isBPh, isBActive);

      if (tierA !== tierB) {
        return tierA - tierB;
      }

      // Within same tier, apply selected sort option
      if (filters.sort === 'deadline') {
        const aVal = aDeadline || Infinity;
        const bVal = bDeadline || Infinity;
        return aVal - bVal;
      } else {
        const aDate = new Date(a.created_at).getTime();
        const bDate = new Date(b.created_at).getTime();
        return bDate - aDate;
      }
    });
  }, [events, filters]);

  const clearFilters = () => {
    setFilters({
      scope: 'all',
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
        resultCount={filteredAndSortedEvents.length} 
      />
      
      {filteredAndSortedEvents.length > 0 ? (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8"
        >
          {filteredAndSortedEvents.map((event) => (
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
            className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
