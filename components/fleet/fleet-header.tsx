import { LogOut, Truck } from 'lucide-react';

import { signOut } from '@/app/(auth)/actions';
import type { UserSummary } from '@/lib/api/types';
import { formatPhone, getInitials } from '@/lib/format';

export type FleetHeaderProps = {
  /**
   * The signed-in fleet owner, or null if the session cookie is missing,
   * expired, or belongs to a role with no fleet dashboard. Resolved
   * server-side in app/fleet/layout.tsx via lib/current-user.ts — the
   * access token lives in an httpOnly cookie no Client Component can
   * read itself. Mirrors components/admin/admin-header.tsx's AdminHeader,
   * which does the same for app/admin/layout.tsx.
   */
  user: UserSummary | null;
};

/**
 * Replaces the fleet dashboard's old second header (app/fleet/page.tsx),
 * which hardcoded an "AU" / "Admin Profile" / "Logistics Ops" chip for
 * every real signed-in fleet owner, and rendered non-interactive
 * "Dashboard / Fleet / Reports" spans that duplicated FleetNav (which
 * already links to /fleet, /fleet/drivers and /fleet/revenue with proper
 * aria-current). This header shows the real signed-in user and puts
 * sign-out in the top-right, beside their identity, where it's
 * discoverable on desktop without scrolling to the bottom of the
 * sidebar.
 */
export function FleetHeader({ user }: FleetHeaderProps) {
  const identity = fleetIdentity(user);

  return (
    <header className="w-full sticky top-0 bg-surface-container border-b border-border flex items-center justify-between px-4 md:px-8 h-20 z-40">
      <div className="flex items-center gap-4">
        <Truck aria-hidden="true" className="h-7 w-7 text-primary" />
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-primary">
          Fleet Operations
        </h1>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        <div className="flex items-center gap-3 bg-surface p-1 pr-4 rounded-full border border-border">
          <div
            aria-hidden="true"
            className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-xs font-bold"
          >
            {identity.initials}
          </div>
          <p
            className={`hidden sm:block text-xs font-bold text-text-primary leading-tight ${
              identity.isPhone ? 'font-mono' : ''
            }`}
          >
            {identity.displayName}
          </p>
        </div>

        <form action={signOut}>
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-sans text-text-secondary transition-all hover:bg-surface-container-high"
          >
            <LogOut aria-hidden="true" className="h-4 w-4" />
            <span>Sign out</span>
          </button>
        </form>
      </div>
    </header>
  );
}

type FleetIdentity = {
  displayName: string;
  initials: string;
  isPhone: boolean;
};

/**
 * Derives what the identity chip shows: the signed-in fleet owner's full
 * name when set, otherwise their formatted phone number (isPhone: true
 * renders it in font-mono — it's a number, not a name). Mirrors
 * components/Navbar.tsx's DashboardLink and
 * components/admin/admin-header.tsx's adminIdentity so the same rules
 * apply everywhere a signed-in identity is shown. A null user (missing or
 * expired session) renders a "Signed out" fallback rather than crashing —
 * this header can't assume app/fleet/layout.tsx always resolved someone.
 */
function fleetIdentity(user: UserSummary | null): FleetIdentity {
  if (!user) {
    return { displayName: 'Signed out', initials: '--', isPhone: false };
  }

  const trimmedName = user.full_name.trim();
  if (trimmedName) {
    return {
      displayName: trimmedName,
      initials: getInitials(trimmedName),
      isPhone: false,
    };
  }

  return {
    displayName: formatPhone(user.phone_number),
    initials: user.phone_number.replace(/\D/g, '').slice(-2),
    isPhone: true,
  };
}
