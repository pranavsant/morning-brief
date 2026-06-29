/**
 * useUserPreferences — persists user-selected news categories in localStorage.
 *
 * The hook is the single source of truth for stored preferences. It reads
 * on first mount and writes on every change, keeping preferences alive
 * across page refreshes.
 *
 * Shape stored in localStorage (key: STORAGE_KEY):
 *   { "categories": ["technology", "business", ...] }
 *
 * Layer: interfaces.
 */

import { useCallback, useState } from 'react';

// ── Constants ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'morning-brief:preferences';

/** All valid category values — mirrors domain VALID_CATEGORIES without
 *  crossing layer boundaries. */
export const PREFERENCE_CATEGORIES = [
  'business',
  'entertainment',
  'general',
  'health',
  'science',
  'sports',
  'technology',
] as const;

export type PreferenceCategory = (typeof PREFERENCE_CATEGORIES)[number];

/** Default selection used when no preferences are found in localStorage. */
const DEFAULT_CATEGORIES: PreferenceCategory[] = ['technology', 'business', 'science'];

// ── Serialisation helpers ─────────────────────────────────────────────────────

interface StoredPreferences {
  categories: string[];
}

function readFromStorage(): PreferenceCategory[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CATEGORIES;

    const parsed = JSON.parse(raw) as unknown;
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      !Array.isArray((parsed as StoredPreferences).categories)
    ) {
      return DEFAULT_CATEGORIES;
    }

    // Filter out any category values that are no longer valid.
    const valid = (parsed as StoredPreferences).categories.filter((c): c is PreferenceCategory =>
      (PREFERENCE_CATEGORIES as readonly string[]).includes(c),
    );

    return valid.length > 0 ? valid : DEFAULT_CATEGORIES;
  } catch {
    return DEFAULT_CATEGORIES;
  }
}

function writeToStorage(categories: PreferenceCategory[]): void {
  try {
    const payload: StoredPreferences = { categories };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Silently ignore storage errors (e.g. private browsing quota exceeded).
  }
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export interface UserPreferencesState {
  /** Currently selected category values. */
  categories: PreferenceCategory[];
  /** Toggle a single category on or off. Persists immediately. */
  toggleCategory: (category: string) => void;
  /** Replace the full category list. Persists immediately. */
  setCategories: (categories: string[]) => void;
  /** Reset to defaults and clear storage. */
  reset: () => void;
}

export function useUserPreferences(): UserPreferencesState {
  const [categories, setStoredCategories] = useState<PreferenceCategory[]>(() =>
    readFromStorage(),
  );

  const persist = useCallback((next: PreferenceCategory[]) => {
    setStoredCategories(next);
    writeToStorage(next);
  }, []);

  const toggleCategory = useCallback(
    (category: string) => {
      if (!(PREFERENCE_CATEGORIES as readonly string[]).includes(category)) return;
      const cat = category as PreferenceCategory;
      persist(
        categories.includes(cat)
          ? categories.filter((c) => c !== cat)
          : [...categories, cat],
      );
    },
    [categories, persist],
  );

  const setCategories = useCallback(
    (next: string[]) => {
      const valid = next.filter((c): c is PreferenceCategory =>
        (PREFERENCE_CATEGORIES as readonly string[]).includes(c),
      );
      persist(valid);
    },
    [persist],
  );

  const reset = useCallback(() => {
    persist([...DEFAULT_CATEGORIES]);
  }, [persist]);

  return { categories, toggleCategory, setCategories, reset };
}
