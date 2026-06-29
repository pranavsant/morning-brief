/**
 * FeedCategoryBar — single-select tab/pill bar for filtering the news feed.
 *
 * Renders an "All" option followed by each of the 7 NewsAPI categories.
 * The active category is visually highlighted with the brand colour.
 *
 * Layer: interfaces.
 */

import { cn } from '../lib/cn';

// Mirrors domain VALID_CATEGORIES without crossing layer boundaries.
export const FEED_CATEGORIES = [
  'business',
  'entertainment',
  'general',
  'health',
  'science',
  'sports',
  'technology',
] as const;

export type FeedCategory = (typeof FEED_CATEGORIES)[number];

interface Props {
  /** Currently active category, or null for "All". */
  active: string | null;
  onChange: (category: string | null) => void;
  disabled?: boolean;
}

interface TabItem {
  value: string | null;
  label: string;
}

const TABS: TabItem[] = [
  { value: null, label: 'All' },
  ...FEED_CATEGORIES.map((c) => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) })),
];

export function FeedCategoryBar({ active, onChange, disabled }: Props) {
  return (
    <div
      role="tablist"
      aria-label="Filter headlines by category"
      className="flex flex-wrap gap-2"
    >
      {TABS.map(({ value, label }) => {
        const isActive = active === value;
        return (
          <button
            key={label}
            type="button"
            role="tab"
            aria-selected={isActive}
            disabled={disabled}
            onClick={() => onChange(value)}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-medium transition',
              'border focus:outline-none focus:ring-2 focus:ring-brand-400',
              isActive
                ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:border-brand-400 hover:text-brand-700',
              disabled && 'cursor-not-allowed opacity-50',
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
