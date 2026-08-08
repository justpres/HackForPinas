'use client';

import { useState } from 'react';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: readonly string[] | readonly { value: string; label: string }[];
  placeholder: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  fullWidth?: boolean;
}

export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder,
  searchPlaceholder = 'Search options...',
  emptyMessage = 'No options found.',
  className,
  fullWidth = false,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);

  // Normalize options to { value, label }
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'string') {
      const label = opt.charAt(0).toUpperCase() + opt.slice(1);
      return { value: opt, label };
    }
    return opt;
  });

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        role="combobox"
        aria-expanded={open}
        className={cn(
          'flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-normal select-none cursor-pointer',
          selectedOption ? 'border-primary/40 bg-primary/10 text-foreground' : 'text-muted-foreground',
          fullWidth ? 'w-full' : 'w-[200px]',
          className
        )}
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <Icon
          icon="fluent:chevron-down-16-regular"
          className="ml-2 h-4 w-4 shrink-0 opacity-50 text-muted-foreground"
        />
      </PopoverTrigger>
      <PopoverContent className={cn('p-0 bg-card rounded-md border shadow-md', fullWidth ? 'w-[var(--popover-trigger-width)]' : 'w-[200px]')} align="start">
        <Command className="bg-card">
          <CommandInput placeholder={searchPlaceholder} className="h-9" />
          <CommandList className="max-h-[220px] overflow-y-auto">
            <CommandEmpty className="py-2 text-center text-xs text-muted-foreground">{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {normalizedOptions.map((opt) => (
                <CommandItem
                  key={opt.value}
                  value={opt.label} // CommandItem matches search against the "value" prop, which behaves as the visible text label by default
                  onSelect={() => {
                    onChange(opt.value === value ? '' : opt.value);
                    setOpen(false);
                  }}
                  className="flex items-center justify-between py-1.5 px-2.5 text-sm cursor-pointer rounded-sm hover:bg-muted"
                >
                  <span className="truncate">{opt.label}</span>
                  <Icon
                    icon="fluent:checkmark-16-regular"
                    className={cn(
                      'h-4 w-4 text-primary shrink-0',
                      value === opt.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
