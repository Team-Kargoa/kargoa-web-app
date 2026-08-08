'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LogOut, Users, Wallet } from 'lucide-react';
import { signOut } from '@/app/(auth)/actions';
import { BrandLink } from '@/components/brand-link';

// The dashboard design (fleet_owner_dashboard_overview/code.html) has a
// desktop sidebar (Dashboard / Fleet Management / Revenue Tracking /
// Settings) and a separate mobile bottom bar (Home / Drivers / Vehicles /
// Alerts) with different labels and item counts. Only /fleet, /fleet/drivers
// and /fleet/revenue exist as routes today — there is no standalone
// /fleet/vehicles or /fleet/alerts, and no settings screen. Rather than ship
// links to routes that don't exist (or dead labels for "Vehicles" / "Alerts"
// / "Settings"), this renders one shared list of the three real
// destinations at both breakpoints, satisfying "same elements, copy and
// order at both breakpoints."
const NAV_ITEMS = [
  { href: '/fleet', label: 'Dashboard', icon: Home },
  { href: '/fleet/drivers', label: 'Drivers', icon: Users },
  { href: '/fleet/revenue', label: 'Revenue', icon: Wallet },
] as const;

export function FleetNav() {
  const pathname = usePathname();

  return (
    <>
      {/* The desktop sidebar below is `hidden md:flex` — invisible on
          phones. Without this, a fleet owner on mobile would have no
          KmerCargo link on any /fleet route (the bottom tab bar has no
          room for it, and app/fleet/page.tsx's own header only exists on
          the dashboard route, not /fleet/drivers or /fleet/revenue). This
          header is the opposite visibility (`md:hidden`), not nested
          inside the sidebar, so it renders regardless of the sidebar's
          own display. */}
      <header className="md:hidden sticky top-0 z-40 flex items-center justify-between border-b border-border bg-surface-container-low px-4 py-3">
        <BrandLink size="sm" className="text-primary" />
        <SignOutButton />
      </header>

      <aside
        aria-label="Fleet navigation"
        className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-64 bg-surface-container-low border-r border-border p-4 gap-2 z-30"
      >
        <div className="mb-4 px-2 pt-2">
          <BrandLink
            size="sm"
            className="text-primary hover:opacity-90 transition"
          />
        </div>
        <nav aria-label="Fleet sections" className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-sans transition-all ${
                  active
                    ? 'bg-primary-container text-primary-container-foreground font-bold'
                    : 'text-text-secondary hover:bg-surface-container-high'
                }`}
              >
                <Icon aria-hidden="true" className="h-5 w-5" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto pt-2">
          <SignOutButton />
        </div>
      </aside>

      <nav
        aria-label="Fleet sections"
        className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-4 py-2 bg-surface border-t border-border shadow-lg z-50"
      >
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all ${
                active
                  ? 'bg-secondary-container text-secondary-container-foreground'
                  : 'text-text-secondary'
              }`}
            >
              <Icon aria-hidden="true" className="h-5 w-5" />
              <span className="font-mono text-[10px]">{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

// A plain <form action={signOut}> submit button so signing out works
// without client JavaScript. Rendered once in the mobile top header and
// once in the desktop sidebar footer — the mobile bottom tab bar has no
// room to spare for it (it's already a tight three-item nav).
function SignOutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-sans text-text-secondary transition-all hover:bg-surface-container-high"
      >
        <LogOut aria-hidden="true" className="h-4 w-4" />
        <span>Sign out</span>
      </button>
    </form>
  );
}
