'use client';

import { useState, useRef } from 'react';
import { Icon } from '@iconify/react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { FilterState } from '@/lib/types';
import { REGIONS, FORMATS, ORGANIZER_TYPES, SORT_OPTIONS } from '@/lib/constants';
import { SearchableSelect } from '@/components/SearchableSelect';

interface FilterBarProps {
  filters: FilterState;
  onChange: (next: Partial<FilterState>) => void;
  resultCount: number;
}

export function FilterBar({ filters, onChange, resultCount }: FilterBarProps) {
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout>(undefined);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      onChange({ search: value });
    }, 300);
  };

  const activeFilterCount =
    (filters.scope && filters.scope !== 'all' ? 1 : 0) +
    (filters.region && filters.region !== 'all' ? 1 : 0) +
    (filters.format && filters.format !== 'all' ? 1 : 0) +
    (filters.organizer_type && filters.organizer_type !== 'all' ? 1 : 0);

  return (
    <div className="sticky top-16 z-30 border-b bg-background/95 py-3 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        {/* Scope Tabs */}
        <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => onChange({ scope: 'all' })}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors cursor-pointer shrink-0",
              (!filters.scope || filters.scope === 'all')
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            All Events
          </button>
          <button
            type="button"
            onClick={() => onChange({ scope: 'philippines' })}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors cursor-pointer shrink-0 flex items-center gap-1.5",
              filters.scope === 'philippines'
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <span>🇵🇭</span> Philippine Tech Events
          </button>
          <button
            type="button"
            onClick={() => onChange({ scope: 'international' })}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors cursor-pointer shrink-0 flex items-center gap-1.5",
              filters.scope === 'international'
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <span>🌐</span> Global / Foreign
          </button>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Icon
              icon="fluent:search-16-regular"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              width={16}
            />
            <input
              type="text"
              placeholder="Search hackathons..."
              defaultValue={filters.search}
              onChange={handleSearchChange}
              className="w-full rounded-md border bg-background py-1.5 pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary h-10"
            />
          </div>

          <div className="hidden items-center gap-3 md:flex flex-wrap">
            <SearchableSelect
              value={filters.region === 'all' ? '' : filters.region}
              onChange={(val) => onChange({ region: val || 'all' })}
              options={REGIONS}
              placeholder="All Regions"
              searchPlaceholder="Search regions..."
            />
            <SearchableSelect
              value={filters.format === 'all' ? '' : filters.format}
              onChange={(val) => onChange({ format: val || 'all' })}
              options={FORMATS}
              placeholder="All Formats"
              searchPlaceholder="Search formats..."
            />
            <SearchableSelect
              value={filters.organizer_type === 'all' ? '' : filters.organizer_type}
              onChange={(val) => onChange({ organizer_type: val || 'all' })}
              options={ORGANIZER_TYPES}
              placeholder="All Organizer Types"
              searchPlaceholder="Search types..."
            />
            <SearchableSelect
              value={filters.sort}
              onChange={(val) => onChange({ sort: (val || 'deadline') as FilterState['sort'] })}
              options={SORT_OPTIONS}
              placeholder="Sort By"
              searchPlaceholder="Search sort..."
            />
            {activeFilterCount > 0 && (
              <button
                onClick={() => onChange({ region: 'all', format: 'all', organizer_type: 'all' })}
                className="text-sm font-medium text-primary hover:underline cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          <button
            onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
            className="flex items-center gap-1.5 rounded-md border bg-background px-3 py-1.5 text-sm md:hidden w-fit cursor-pointer h-10 justify-center"
          >
            <Icon icon="fluent:filter-16-regular" width={16} />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-1 rounded-sm bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        <AnimatePresence>
          {isMobileFiltersOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden md:hidden"
            >
              <div className="flex flex-col gap-3 pt-4">
                <SearchableSelect
                  value={filters.region === 'all' ? '' : filters.region}
                  onChange={(val) => onChange({ region: val || 'all' })}
                  options={REGIONS}
                  placeholder="All Regions"
                  searchPlaceholder="Search regions..."
                  fullWidth
                />
                <SearchableSelect
                  value={filters.format === 'all' ? '' : filters.format}
                  onChange={(val) => onChange({ format: val || 'all' })}
                  options={FORMATS}
                  placeholder="All Formats"
                  searchPlaceholder="Search formats..."
                  fullWidth
                />
                <SearchableSelect
                  value={filters.organizer_type === 'all' ? '' : filters.organizer_type}
                  onChange={(val) => onChange({ organizer_type: val || 'all' })}
                  options={ORGANIZER_TYPES}
                  placeholder="All Organizer Types"
                  searchPlaceholder="Search types..."
                  fullWidth
                />
                <SearchableSelect
                  value={filters.sort}
                  onChange={(val) => onChange({ sort: (val || 'deadline') as FilterState['sort'] })}
                  options={SORT_OPTIONS}
                  placeholder="Sort By"
                  searchPlaceholder="Search sort..."
                  fullWidth
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-4 text-sm text-muted-foreground">
          {resultCount} event{resultCount !== 1 ? 's' : ''} found
        </div>
      </div>
    </div>
  );
}
