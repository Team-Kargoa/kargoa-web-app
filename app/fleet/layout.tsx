import { redirect } from 'next/navigation';

import { FleetHeader } from '@/components/fleet/fleet-header';
import { FleetNav } from '@/components/fleet/fleet-nav';
import { getCurrentUser } from '@/lib/current-user';

export default async function FleetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Route gate for the whole /fleet tree: without it, an anonymous visitor
  // reaches the dashboard, and every page's own `getAccessToken() ?? ''`
  // turns the resulting 401 into a silent fixture fallback via
  // withFallback — a complete fleet dashboard with fabricated wallet
  // balances, revenue and driver rosters, no sign anything is wrong.
  // getCurrentUser only ever resolves to fleet_owner or admin (or null),
  // so any non-null, non-fleet_owner user here is an admin.
  const user = await getCurrentUser();
  if (!user) redirect('/signin');
  if (user.role !== 'fleet_owner') redirect('/admin');

  return (
    <div className="min-h-screen bg-background">
      <FleetNav />
      <div className="md:pl-64 flex min-h-screen flex-col">
        {/* The access token lives in an httpOnly cookie FleetHeader (a
            Client Component boundary once it needs one) cannot read
            itself, so this Server Component resolves the signed-in fleet
            owner and passes it down — same pattern as app/admin/layout.tsx
            threading user into AdminHeader. Rendered here (not in
            app/fleet/page.tsx) so every /fleet route gets a real identity
            and a discoverable sign-out control, not just the dashboard. */}
        <FleetHeader user={user} />
        {children}
      </div>
    </div>
  );
}
