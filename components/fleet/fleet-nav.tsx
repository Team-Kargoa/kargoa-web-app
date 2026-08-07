'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Truck, Users, Wallet } from 'lucide-react';

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
      <aside
        aria-label="Fleet navigation"
        className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-64 bg-surface-container-low border-r border-border p-4 gap-2 z-30"
      >
        <div className="mb-4 px-2 pt-2">
          <Link
            href="/"
            className="flex items-center gap-2 font-heading text-xl font-black text-primary hover:opacity-90 transition"
          >
            <Truck aria-hidden="true" className="h-5 w-5" />
            <span>KmerCargo</span>
          </Link>
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
