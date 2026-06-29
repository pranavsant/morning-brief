/**
 * DarkModeContext — provides the dark-mode state tree-wide so the Navbar
 * toggle and SettingsPage both reference the same `isDark` / `toggle` pair
 * without prop-drilling.
 *
 * Usage:
 *   // Wrap at the app root (done in App.tsx):
 *   <DarkModeProvider> … </DarkModeProvider>
 *
 *   // Consume anywhere below:
 *   const { isDark, toggle } = useDarkModeContext();
 *
 * Layer: interfaces.
 */

import { createContext, useContext, type ReactNode } from 'react';
import { useDarkMode, type DarkModeState } from '../hooks/useDarkMode';

// ── Context ───────────────────────────────────────────────────────────────────

const DarkModeContext = createContext<DarkModeState | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

interface Props {
  children: ReactNode;
}

export function DarkModeProvider({ children }: Props) {
  const darkMode = useDarkMode();
  return (
    <DarkModeContext.Provider value={darkMode}>
      {children}
    </DarkModeContext.Provider>
  );
}

// ── Consumer hook ─────────────────────────────────────────────────────────────

export function useDarkModeContext(): DarkModeState {
  const ctx = useContext(DarkModeContext);
  if (!ctx) {
    throw new Error('useDarkModeContext must be used within a DarkModeProvider');
  }
  return ctx;
}
