/**
 * useDarkMode — persists the user's dark/light mode preference in localStorage
 * and synchronises the `dark` class on `<html>` so Tailwind's `dark:` variants
 * activate automatically.
 *
 * Initialisation order (first match wins):
 *   1. Value stored in localStorage under STORAGE_KEY
 *   2. OS-level `prefers-color-scheme: dark` media query
 *   3. Light mode (default)
 *
 * The hook applies the class immediately on mount so there is no flash of
 * unstyled content between render and effect. The `dark` class is toggled
 * on `document.documentElement` (the `<html>` element) so every Tailwind
 * `dark:` utility in the tree responds to a single point of truth.
 *
 * Layer: interfaces.
 */

import { useCallback, useEffect, useState } from 'react';

// ── Constants ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'morning-brief:dark-mode';

// ── Helpers ───────────────────────────────────────────────────────────────────

function readInitialPreference(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) return stored === 'true';
  } catch {
    // localStorage unavailable (e.g. private browsing with strict settings)
  }
  // Fall back to OS preference.
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyClass(isDark: boolean): void {
  document.documentElement.classList.toggle('dark', isDark);
}

function writeToStorage(isDark: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(isDark));
  } catch {
    // Silently ignore storage errors.
  }
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export interface DarkModeState {
  /** True when dark mode is currently active. */
  isDark: boolean;
  /** Toggle between dark and light mode. Persists immediately. */
  toggle: () => void;
  /** Explicitly set the mode. Persists immediately. */
  setDark: (dark: boolean) => void;
}

export function useDarkMode(): DarkModeState {
  const [isDark, setIsDark] = useState<boolean>(() => {
    const dark = readInitialPreference();
    // Apply synchronously during the initial render so Tailwind classes
    // are correct before the first paint.
    applyClass(dark);
    return dark;
  });

  // Keep the class in sync whenever the state changes after mount.
  useEffect(() => {
    applyClass(isDark);
  }, [isDark]);

  const setDark = useCallback((dark: boolean) => {
    setIsDark(dark);
    writeToStorage(dark);
  }, []);

  const toggle = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      writeToStorage(next);
      return next;
    });
  }, []);

  return { isDark, toggle, setDark };
}
