import { Truck, Wallet as WalletIcon } from 'lucide-react';
import { redirect } from 'next/navigation';
import { getAccessToken } from '@/lib/session';
import { getWallet } from '@/lib/api/payments';
import {
  getFleetSummary,
  getWeeklyPerformance,
  getActiveDrivers,
} from '@/lib/api/fleet';
import { formatXaf } from '@/lib/format';
import { StatCard, type StatCardAvatar } from '@/components/fleet/stat-card';
import { PerformanceChart } from '@/components/fleet/performance-chart';
import { DriverTable } from '@/components/fleet/driver-table';

const AVATAR_TONES: StatCardAvatar['tone'][] = [
  'primary',
  'secondary',
  'tertiary',
];

export default async function FleetDashboardPage() {
  // app/fleet/layout.tsx already gates this whole tree on a signed-in
  // fleet_owner, so this should always resolve — this check is defence in
  // depth (the same pattern app/admin's pages use), and makes a missing
  // token structurally impossible to paper over with `?? ''` the way it
  // silently was before, which turned a 401 into a fixture fallback that
  // read as a real dashboard to a signed-out visitor.
  const token = await getAccessToken();
  if (!token) redirect('/signin');

  const [wallet, summary, performance, drivers] = await Promise.all([
    getWallet(token),
    getFleetSummary(token),
    getWeeklyPerformance(token),
    getActiveDrivers(token),
  ]);

  const avatars: StatCardAvatar[] =
    summary.data.pendingVerificationInitials.map((initials, index) => ({
      initials,
      tone: AVATAR_TONES[index % AVATAR_TONES.length],
    }));

  return (
    <main className="max-w-7xl mx-auto w-full px-4 md:px-8 py-6 md:py-8 pb-24 md:pb-8">
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          label="Active Trucks"
          value={String(summary.data.activeTrucks)}
          valueSuffix={`/ ${summary.data.totalTrucks}`}
          icon={Truck}
          tone="neutral"
          progress={{
            current: summary.data.activeTrucks,
            max: summary.data.totalTrucks,
          }}
          footnote={`${summary.data.offlineForMaintenance} Vehicles currently offline for maintenance`}
          isSample={summary.isSample}
        />

        <StatCard
          label="Total Fleet Earnings"
          value={formatXaf(wallet.data.balance)}
          icon={WalletIcon}
          tone="gradient"
          trend={summary.data.earningsTrend}
          isSample={wallet.isSample}
        />

        <StatCard
          label="Pending Verifications"
          value={String(summary.data.pendingVerifications).padStart(2, '0')}
          tone="danger"
          badge="Requires Action"
          avatars={avatars}
          footnote="Driver documents expiring in < 7 days"
          isSample={summary.isSample}
        />
      </section>

      <PerformanceChart
        data={performance.data}
        isSample={performance.isSample}
      />

      <DriverTable drivers={drivers.data} isSample={drivers.isSample} />
    </main>
  );
}
