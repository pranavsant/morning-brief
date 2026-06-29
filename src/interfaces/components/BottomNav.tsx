/**
 * BottomNav — mobile-first fixed bottom navigation bar.
 *
 * Visible only on small screens (hidden on md and above). Each item
 * shows an SVG icon + short label. The active route is highlighted with
 * the brand colour.
 *
 * z-30 keeps it above regular content but below the ArticleDetailModal (z-50).
 *
 * Layer: interfaces.
 */

import { NavLink } from 'react-router-dom';
import { cn } from '../lib/cn';

// ── Icon components (inline SVG, 24×24 viewBox) ───────────────────────────────

function FeedIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 6h16M4 10h16M4 14h10M4 18h8" />
    </svg>
  );
}

function BriefIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <path d="M9 12h6M9 16h4" />
    </svg>
  );
}

function BookmarkIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

// ── Nav item config ───────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { to: '/',         label: 'Feed',       Icon: FeedIcon     },
  { to: '/brief',    label: 'Your Brief', Icon: BriefIcon    },
  { to: '/saved',    label: 'Saved',      Icon: BookmarkIcon },
  { to: '/settings', label: 'Preferences',Icon: SettingsIcon },
] as const;

// ── Component ─────────────────────────────────────────────────────────────────

export function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur-sm md:hidden"
      aria-label="Mobile navigation"
    >
      <ul className="flex h-16 items-stretch" role="list">
        {NAV_ITEMS.map(({ to, label, Icon }) => (
          <li key={to} className="flex flex-1">
            <NavLink
              to={to}
              end
              className={({ isActive }) =>
                cn(
                  'flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-400',
                  isActive
                    ? 'text-brand-600'
                    : 'text-slate-500 hover:text-slate-800 active:text-brand-500',
                )
              }
              aria-label={label}
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={cn(
                      'h-5 w-5 transition-transform',
                      isActive && 'scale-110',
                    )}
                  />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
