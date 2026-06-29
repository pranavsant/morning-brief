/**
 * AppLayout — global page layout shell.
 *
 * Renders the sticky Navbar at the top, the BottomNav on mobile, and a
 * <main> content area that fills the remaining viewport height. Adds
 * `pb-16` on small screens so content never hides behind the BottomNav,
 * and removes that padding on md+ where BottomNav is hidden.
 *
 * All page components are rendered as children of this layout.
 *
 * Layer: interfaces.
 */

import type { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { BottomNav } from './BottomNav';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      {/* Top navigation bar */}
      <Navbar />

      {/* Page content — grows to fill available space */}
      <main className="flex-1 pb-16 md:pb-0">
        {children}
      </main>

      {/* Footer — shown above bottom nav on desktop, hidden-ish on mobile */}
      <footer className="hidden md:block py-8 text-center text-xs text-slate-400 border-t border-slate-100 dark:border-slate-800 dark:text-slate-600">
        Morning Brief · Built with React, Tailwind, NewsAPI &amp; Claude · Clean Architecture
      </footer>

      {/* Mobile bottom navigation */}
      <BottomNav />
    </div>
  );
}
