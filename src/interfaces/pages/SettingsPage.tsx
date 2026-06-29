/**
 * SettingsPage — lets users customise their preferred news categories
 * and toggle dark / light mode.
 *
 * Category preferences are persisted to localStorage immediately on toggle
 * so they survive page refreshes. A subtle "Saved" indicator confirms each
 * change without requiring an explicit "Save" button.
 *
 * Dark mode is persisted via useDarkMode (DarkModeContext) under the key
 * "morning-brief:dark-mode" in localStorage.
 *
 * Layer: interfaces.
 */

import { useEffect, useRef, useState } from 'react';
import {
  useUserPreferences,
  PREFERENCE_CATEGORIES,
} from '../hooks/useUserPreferences';
import { useDarkModeContext } from '../context/DarkModeContext';
import { cn } from '../lib/cn';

const CATEGORY_META: Record<
  string,
  { emoji: string; description: string }
> = {
  business:      { emoji: '💼', description: 'Markets, economy, and corporate news' },
  entertainment: { emoji: '🎬', description: 'Movies, music, TV, and celebrity' },
  general:       { emoji: '🌐', description: 'Top stories from around the world' },
  health:        { emoji: '🏥', description: 'Medicine, wellness, and public health' },
  science:       { emoji: '🔬', description: 'Research, discoveries, and innovation' },
  sports:        { emoji: '⚽', description: 'Scores, transfers, and sporting events' },
  technology:    { emoji: '💻', description: 'Tech industry, gadgets, and software' },
};

export function SettingsPage() {
  const { categories, toggleCategory, reset } = useUserPreferences();
  const { isDark, setDark } = useDarkModeContext();

  // "Saved" flash indicator — shown briefly after each change.
  const [saved, setSaved] = useState(false);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Show "Saved" indicator whenever categories changes (after initial mount).
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setSaved(true);
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    savedTimerRef.current = setTimeout(() => setSaved(false), 2000);
    return () => {
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    };
  }, [categories]);

  const handleToggle = (category: string) => {
    // Always keep at least 1 category selected.
    if (categories.includes(category as never) && categories.length === 1) return;
    toggleCategory(category);
  };

  const handleReset = () => {
    reset();
  };

  return (
    <main className="mx-auto max-w-screen-md px-4 py-10">
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <header className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-slate-900 dark:text-slate-100">
          ⚙️ Preferences
        </h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Choose the news categories you care about. These selections are saved automatically and
          used as your default topics for the Morning Brief.
        </p>
      </header>

      {/* ── Dark mode toggle ─────────────────────────────────────────────── */}
      <section
        aria-label="Appearance"
        className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900"
      >
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Appearance
        </h2>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xl" aria-hidden="true">
              {isDark ? '🌙' : '☀️'}
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {isDark ? 'Dark mode' : 'Light mode'}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Saved automatically. Follows your OS preference by default.
              </p>
            </div>
          </div>

          {/* Toggle switch */}
          <button
            type="button"
            role="switch"
            aria-checked={isDark}
            aria-label={isDark ? 'Disable dark mode' : 'Enable dark mode'}
            onClick={() => setDark(!isDark)}
            className={cn(
              'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900',
              isDark ? 'bg-brand-500' : 'bg-slate-200',
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition-transform duration-200',
                isDark ? 'translate-x-5' : 'translate-x-0',
              )}
            />
          </button>
        </div>
      </section>

      {/* ── Category selection ───────────────────────────────────────────── */}
      <section
        aria-label="Category preferences"
        className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            News categories
          </h2>

          {/* Saved indicator */}
          <span
            aria-live="polite"
            className={cn(
              'text-xs font-medium transition-opacity duration-300',
              saved ? 'text-emerald-600 opacity-100 dark:text-emerald-400' : 'opacity-0',
            )}
          >
            ✓ Saved
          </span>
        </div>

        {/* Category cards */}
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2" role="list">
          {PREFERENCE_CATEGORIES.map((category) => {
            const isSelected = categories.includes(category);
            const isOnlyOne  = isSelected && categories.length === 1;
            const meta       = CATEGORY_META[category];

            return (
              <li key={category}>
                <button
                  type="button"
                  onClick={() => handleToggle(category)}
                  disabled={isOnlyOne}
                  aria-pressed={isSelected}
                  title={isOnlyOne ? 'At least one category must be selected' : undefined}
                  className={cn(
                    'w-full rounded-xl border px-4 py-3 text-left transition',
                    'focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-1 dark:focus:ring-offset-slate-900',
                    isSelected
                      ? 'border-brand-400 bg-brand-50 shadow-sm dark:border-brand-600 dark:bg-brand-950'
                      : 'border-slate-200 bg-white hover:border-brand-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-brand-600 dark:hover:bg-slate-700',
                    isOnlyOne && 'cursor-not-allowed opacity-60',
                  )}
                >
                  <div className="flex items-center gap-3">
                    {/* Checkbox visual */}
                    <span
                      aria-hidden="true"
                      className={cn(
                        'flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border transition',
                        isSelected
                          ? 'border-brand-500 bg-brand-500 text-white'
                          : 'border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-700',
                      )}
                    >
                      {isSelected && (
                        <svg
                          viewBox="0 0 12 12"
                          fill="none"
                          className="h-3 w-3"
                          aria-hidden="true"
                        >
                          <path
                            d="M2 6l3 3 5-5"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </span>

                    <span className="text-lg leading-none" aria-hidden="true">
                      {meta.emoji}
                    </span>

                    <div className="min-w-0">
                      <span
                        className={cn(
                          'block text-sm font-semibold capitalize',
                          isSelected
                            ? 'text-brand-700 dark:text-brand-400'
                            : 'text-slate-800 dark:text-slate-200',
                        )}
                      >
                        {category}
                      </span>
                      <span className="block text-xs text-slate-400 dark:text-slate-500">
                        {meta.description}
                      </span>
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>

        {/* Helper text + Reset */}
        <div className="mt-5 flex items-center justify-between">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {categories.length === PREFERENCE_CATEGORIES.length
              ? 'All categories selected'
              : `${categories.length} of ${PREFERENCE_CATEGORIES.length} categories selected`}
          </p>
          <button
            type="button"
            onClick={handleReset}
            className="text-xs font-medium text-slate-400 hover:text-slate-600 focus:outline-none focus:underline dark:text-slate-500 dark:hover:text-slate-300"
          >
            Reset to defaults
          </button>
        </div>
      </section>

      {/* ── Info callout ─────────────────────────────────────────────────── */}
      <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
        <strong className="font-medium text-slate-700 dark:text-slate-300">Tip:</strong> Your
        preferences are stored locally in your browser. They are applied automatically whenever you
        visit the <strong>Your Brief</strong> page.
      </div>
    </main>
  );
}
