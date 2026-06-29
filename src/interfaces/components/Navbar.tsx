/**
 * Navbar — top navigation bar.
 *
 * Responsive design:
 *  • Desktop (md+): sticky top bar showing logo/wordmark on the left and
 *    all four navigation links on the right.
 *  • Mobile (<md): sticky top bar showing logo/wordmark only. Navigation
 *    is handled by the BottomNav component at the bottom of the screen.
 *
 * Uses NavLink from react-router-dom for automatic active-state styling.
 *
 * Layer: interfaces.
 */

import { NavLink } from 'react-router-dom';
import { cn } from '../lib/cn';

const NAV_ITEMS = [
  { to: '/',         label: 'Feed'        },
  { to: '/brief',    label: 'Your Brief'  },
  { to: '/saved',    label: 'Saved'       },
  { to: '/settings', label: 'Preferences' },
] as const;

// ── Logo mark (inline SVG matching public/favicon.svg) ────────────────────────

function LogoMark() {
  return (
    <svg
      viewBox="0 0 64 64"
      width="28"
      height="28"
      className="flex-shrink-0"
      aria-hidden="true"
    >
      <rect width="64" height="64" rx="14" fill="#ee8418" />
      <text
        x="50%"
        y="54%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize="34"
      >
        ☕
      </text>
    </svg>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-screen-xl items-center justify-between px-4 py-3">

        {/* ── Brand ─────────────────────────────────────────────────────── */}
        <NavLink
          to="/"
          className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 rounded-md"
          aria-label="Morning Brief — home"
        >
          <LogoMark />
          <span className="font-serif text-lg font-bold text-slate-900 leading-none">
            Morning Brief
          </span>
        </NavLink>

        {/* ── Desktop nav — hidden below md breakpoint ───────────────────── */}
        <nav aria-label="Main navigation">
          <ul className="hidden md:flex items-center gap-1" role="list">
            {NAV_ITEMS.map(({ to, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end
                  className={({ isActive }) =>
                    cn(
                      'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400',
                      isActive
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                    )
                  }
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
