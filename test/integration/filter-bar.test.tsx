import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilterBar } from '@/components/FilterBar';
import { FilterState } from '@/lib/types';

describe('FilterBar Component Integration', () => {
  const defaultFilters: FilterState = {
    scope: 'all',
    region: 'all',
    format: 'all',
    organizer_type: 'all',
    sort: 'deadline',
    search: '',
  };

  it('renders all scope tabs', () => {
    const onChange = vi.fn();
    render(<FilterBar filters={defaultFilters} onChange={onChange} resultCount={10} />);

    expect(screen.getByText('All Events')).toBeDefined();
    expect(screen.getByText('Philippine Tech Events')).toBeDefined();
    expect(screen.getByText('Global / Foreign')).toBeDefined();
  });

  it('calls onChange with scope when clicked', () => {
    const onChange = vi.fn();
    render(<FilterBar filters={defaultFilters} onChange={onChange} resultCount={10} />);

    const phButton = screen.getByText('Philippine Tech Events');
    fireEvent.click(phButton);
    expect(onChange).toHaveBeenCalledWith({ scope: 'philippines' });

    const globalButton = screen.getByText('Global / Foreign');
    fireEvent.click(globalButton);
    expect(onChange).toHaveBeenCalledWith({ scope: 'international' });
  });

  it('displays accurate result count for plural and singular', () => {
    const onChange = vi.fn();
    const { rerender } = render(<FilterBar filters={defaultFilters} onChange={onChange} resultCount={42} />);
    expect(screen.getByText('42 events found')).toBeDefined();

    rerender(<FilterBar filters={defaultFilters} onChange={onChange} resultCount={1} />);
    expect(screen.getByText('1 event found')).toBeDefined();
  });

  it('handles debounced search input', () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    render(<FilterBar filters={defaultFilters} onChange={onChange} resultCount={10} />);

    const searchInput = screen.getByPlaceholderText('Search hackathons...');
    fireEvent.change(searchInput, { target: { value: 'AI Manila' } });

    expect(onChange).not.toHaveBeenCalled();

    vi.advanceTimersByTime(350);
    expect(onChange).toHaveBeenCalledWith({ search: 'AI Manila' });
    vi.useRealTimers();
  });

  it('renders clear filters button when non-scope filters are active', () => {
    const onChange = vi.fn();
    render(
      <FilterBar
        filters={{ ...defaultFilters, region: 'NCR', format: 'online' }}
        onChange={onChange}
        resultCount={5}
      />
    );

    const clearButton = screen.getByText('Clear');
    expect(clearButton).toBeDefined();

    fireEvent.click(clearButton);
    expect(onChange).toHaveBeenCalledWith({
      region: 'all',
      format: 'all',
      organizer_type: 'all',
    });
  });
});
