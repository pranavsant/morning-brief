/**
 * MorningBriefContext — lifts the morning-brief state above the router so a
 * single brief instance is shared across every page.
 *
 * Both HomePage and BriefPage generate and display "the brief". Previously
 * each page called useMorningBrief() directly, giving each its own isolated
 * useState. The consequences:
 *   • A brief generated on the Feed page never appeared on Your Brief (and
 *     vice-versa) — they were two unrelated state trees.
 *   • Switching tabs unmounted the active page, destroying its local state,
 *     so the brief vanished.
 *
 * By hosting one useMorningBrief() instance in a provider mounted above
 * <Routes>, the state outlives page mounts/unmounts and is identical wherever
 * it is read.
 *
 * Usage:
 *   // Wrap above the router (done in App.tsx):
 *   <MorningBriefProvider> … </MorningBriefProvider>
 *
 *   // Consume in any page:
 *   const { brief, loading, error, generate, reset } = useMorningBriefContext();
 *
 * Layer: interfaces.
 */

import { createContext, useContext, type ReactNode } from 'react';
import { useMorningBrief, type UseMorningBriefState } from '../hooks/useMorningBrief';

// ── Context ───────────────────────────────────────────────────────────────────

const MorningBriefContext = createContext<UseMorningBriefState | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

interface Props {
  children: ReactNode;
}

export function MorningBriefProvider({ children }: Props) {
  const morningBrief = useMorningBrief();
  return (
    <MorningBriefContext.Provider value={morningBrief}>
      {children}
    </MorningBriefContext.Provider>
  );
}

// ── Consumer hook ─────────────────────────────────────────────────────────────

export function useMorningBriefContext(): UseMorningBriefState {
  const ctx = useContext(MorningBriefContext);
  if (!ctx) {
    throw new Error('useMorningBriefContext must be used within a MorningBriefProvider');
  }
  return ctx;
}
