import { Truck, Wallet as WalletIcon } from 'lucide-react';
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
  const token = (await getAccessToken()) ?? '';

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
    <>
      <header className="w-full sticky top-0 bg-surface-container border-b border-border flex items-center justify-between px-4 md:px-8 h-20 z-40">
        <div className="flex items-center gap-4">
          <Truck aria-hidden="true" className="h-7 w-7 text-primary" />
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-primary">
            Fleet Operations
          </h1>
        </div>

        <div className="flex items-center gap-6">
          {/* These nav items have no destinations yet — /fleet/drivers and
              /fleet/revenue land in a later task. Rendered as plain,
              non-interactive text (as in the design) rather than links to
              routes that don't exist. */}
          <nav className="hidden md:flex gap-4" aria-label="Fleet sections">
            <span className="text-primary font-bold font-sans text-sm">
              Dashboard
            </span>
            <span className="text-text-secondary font-sans text-sm px-3 py-1 rounded">
              Fleet
            </span>
            <span className="text-text-secondary font-sans text-sm px-3 py-1 rounded">
              Reports
            </span>
          </nav>

          <div className="flex items-center gap-3 bg-surface p-1 pr-4 rounded-full border border-border">
            <div
              aria-hidden="true"
              className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-xs font-bold"
            >
              AU
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-bold text-text-primary leading-tight">
                Admin Profile
              </p>
              <p className="text-[10px] text-text-secondary">Logistics Ops</p>
            </div>
          </div>
        </div>
      </header>

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
    </>
  );
}
