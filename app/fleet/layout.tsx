import { redirect } from 'next/navigation';

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
      <div className="md:pl-64">{children}</div>
    </div>
  );
}
