/**
 * CategoryPicker — multi-select toggle for news categories.
 *
 * Layer: interfaces.
 */

import { cn } from '../lib/cn';

// Mirrors domain CategoryValue, but declared locally so the interfaces
// layer does not import from the domain layer.
export const CATEGORIES = [
  'business',
  'entertainment',
  'general',
  'health',
  'science',
  'sports',
  'technology',
] as const;

interface Props {
  selected: string[];
  onToggle: (category: string) => void;
  disabled?: boolean;
}

export function CategoryPicker({ selected, onToggle, disabled }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((category) => {
        const isActive = selected.includes(category);
        return (
          <button
            key={category}
            type="button"
            disabled={disabled}
            onClick={() => onToggle(category)}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-medium capitalize transition',
              'border focus:outline-none focus:ring-2 focus:ring-brand-400',
              isActive
                ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                : 'bg-white text-slate-700 border-slate-300 hover:border-brand-400',
              disabled && 'opacity-50 cursor-not-allowed',
            )}
            aria-pressed={isActive}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
