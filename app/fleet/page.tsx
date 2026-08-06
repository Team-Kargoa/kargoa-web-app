import { Truck, Wallet as WalletIcon } from 'lucide-react';
import { getAccessToken } from '@/lib/session';
import { getWallet } from '@/lib/api/payments';
import {
  getFleetSummary,
  getWeeklyPerformance,
  getActiveDrivers,
} from '@/lib/api/fleet';
import { formatXaf } from '@/lib/format';
import {
  StatCard,
  type StatCardAvatar,
} from '@/components/fleet/stat-card';
import { PerformanceChart } from '@/components/fleet/performance-chart';
import { DriverTable } from '@/components/fleet/driver-table';

const AVATAR_TONES: StatCardAvatar['tone'][] = [
  'primary',
  'secondary',
  'tertiary',
];

export default async function FleetDashboardPage() {
  const token = (await getAccessToken()) ?? '';

  const [wallet, summary, performance, drivers] = await Promise.all([
    getWallet(token),
    getFleetSummary(token),
    getWeeklyPerformance(token),
    getActiveDrivers(token),
  ]);

  const avatars: StatCardAvatar[] = summary.pendingVerificationInitials.map(
    (initials, index) => ({
      initials,
      tone: AVATAR_TONES[index % AVATAR_TONES.length],
    }),
  );

  return (
    <>
      <header className="w-full sticky top-0 bg-surface-container border-b border-border flex items-center px-4 md:px-8 h-20 z-40">
        <div className="flex items-center gap-3">
          <Truck aria-hidden="true" className="h-7 w-7 text-primary" />
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-primary">
            Fleet Operations
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full px-4 md:px-8 py-6 md:py-8 pb-24 md:pb-8">
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            label="Active Trucks"
            value={String(summary.activeTrucks)}
            valueSuffix={`/ ${summary.totalTrucks}`}
            icon={Truck}
            tone="neutral"
            progress={{ current: summary.activeTrucks, max: summary.totalTrucks }}
            footnote={`${summary.offlineForMaintenance} Vehicles currently offline for maintenance`}
          />

          <StatCard
            label="Total Fleet Earnings"
            value={formatXaf(wallet.balance)}
            icon={WalletIcon}
            tone="gradient"
            trend={summary.earningsTrend}
          />

          <StatCard
            label="Pending Verifications"
            value={String(summary.pendingVerifications).padStart(2, '0')}
            tone="danger"
            badge="Requires Action"
            avatars={avatars}
            footnote="Driver documents expiring in < 7 days"
          />
        </section>

        <PerformanceChart data={performance} />

        <DriverTable drivers={drivers} />
      </main>
    </>
  );
}
