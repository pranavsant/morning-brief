/**
 * SearchBar — accessible search input for querying articles.
 *
 * Fires `onChange` on every keystroke (parent hooks handle debounce)
 * and `onSubmit` on Enter or the search button click.
 * Displays a clear (✕) button when the input has a value.
 *
 * Layer: interfaces.
 */

import { FormEvent, useRef } from 'react';
import { cn } from '../lib/cn';

interface Props {
  value: string;
  onChange: (q: string) => void;
  onSubmit: (q: string) => void;
  onClear: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChange,
  onSubmit,
  onClear,
  disabled,
  placeholder = 'Search articles…',
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(value);
    inputRef.current?.blur();
  };

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className="flex w-full items-center gap-2"
      aria-label="Search articles"
    >
      <div className="relative flex-1">
        {/* Search icon */}
        <span
          className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400 dark:text-slate-500"
          aria-hidden="true"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
            />
          </svg>
        </span>

        <input
          ref={inputRef}
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          aria-label="Search query"
          className={cn(
            'w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-9',
            'text-sm text-slate-900 placeholder:text-slate-400',
            'focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/30',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500',
            'dark:focus:border-brand-500 dark:focus:ring-brand-500/30',
          )}
        />

        {/* Clear button — shown only when there is a value */}
        {value && (
          <button
            type="button"
            onClick={onClear}
            aria-label="Clear search"
            className={cn(
              'absolute inset-y-0 right-2 flex items-center px-1',
              'text-slate-400 hover:text-slate-600 focus:outline-none',
              'dark:text-slate-500 dark:hover:text-slate-300',
            )}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className={cn(
          'rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition',
          'hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-400',
          (disabled || !value.trim()) && 'cursor-not-allowed opacity-50',
        )}
      >
        Search
      </button>
    </form>
  );
}
