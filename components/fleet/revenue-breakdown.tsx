import {
  Landmark,
  ReceiptText,
  TrendingUp,
  Search,
  Calendar,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type {
  RevenueSummary,
  SettlementTransaction,
  SettlementTransactionStatus,
} from '@/lib/api/payments';
import { formatXaf } from '@/lib/format';
import { StatCard } from './stat-card';
import { SampleDataBadge } from '@/components/sample-data-badge';

export type RevenueBreakdownProps = {
  summary: RevenueSummary;
  transactions: SettlementTransaction[];
  /** Shows the shared SampleDataBadge on the balance hero card and the
   * "This Month's Gross" stat when `summary` came from a lib/api fallback
   * fixture rather than the real endpoint. */
  isSummarySample?: boolean;
  /** Same, but for the Settlement Breakdown table below. */
  isTransactionsSample?: boolean;
};

const STATUS_META: Record<
  SettlementTransactionStatus,
  { label: string; className: string }
> = {
  settled: {
    label: 'SETTLED',
    className: 'bg-success-momo/10 text-success-momo',
  },
  pending: {
    label: 'PENDING',
    className: 'bg-primary-container/10 text-primary-container-foreground',
  },
  flagged: {
    label: 'FLAGGED',
    className: 'bg-error-container/20 text-error',
  },
};

export function RevenueBreakdown({
  summary,
  transactions,
  isSummarySample,
  isTransactionsSample,
}: RevenueBreakdownProps) {
  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8">
      <h2 className="font-heading text-2xl md:text-3xl text-text-primary">
        Revenue Tracking
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hand-rolled, not StatCard: this hero card has no equivalent for
            its action buttons (Withdraw/History), its description
            paragraph, or its 2/3-width span — StatCard has no slot for
            any of those. */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-xl bg-primary text-primary-foreground p-8 flex flex-col justify-between min-h-[280px] shadow-xl">
          <div>
            <div className="flex justify-between items-start gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-sans text-sm opacity-80 uppercase tracking-widest">
                    Available Balance
                  </span>
                  {isSummarySample && <SampleDataBadge />}
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="font-mono text-4xl font-bold">
                    {formatXaf(summary.availableBalance)}
                  </span>
                </div>
              </div>
              <div className="bg-primary-container text-primary-container-foreground px-4 py-2 rounded-full font-mono text-sm whitespace-nowrap">
                {summary.netPayoutPercent}% Net Payout
              </div>
            </div>
            <p className="font-sans text-sm mt-4 opacity-80 max-w-sm">
              Total net earnings from all digital trips across the fleet for the
              current settlement period.
            </p>
          </div>
          <div className="relative z-10 flex flex-wrap gap-4 mt-8">
            <button
              type="button"
              className="bg-success-momo text-white h-14 px-8 rounded-xl font-sans font-semibold flex items-center gap-3 hover:brightness-110 active:scale-95 transition-all shadow-lg"
            >
              <Landmark aria-hidden="true" className="h-5 w-5" />
              Withdraw to Business MoMo
            </button>
            <button
              type="button"
              className="bg-primary-foreground/10 border border-primary-foreground/20 h-14 px-6 rounded-xl font-sans font-semibold flex items-center gap-3 hover:bg-primary-foreground/20 transition-all"
            >
              <ReceiptText aria-hidden="true" className="h-5 w-5" />
              History
            </button>
          </div>
        </div>

        {/* Composed entirely from StatCard's existing typed props — no
            children escape hatch. The bar rides `progress` (netPayoutPercent
            of 100) and the trip-volume line rides `trend`. Commission has no
            dedicated prop, so it's folded into `footnote` as one combined
            string rather than the original two-column row. */}
        {/* Same `summary` source as the hero card above — the badge for
            this section lives there once rather than repeating per card. */}
        <StatCard
          label="This Month's Gross"
          value={formatXaf(summary.monthGross)}
          icon={TrendingUp}
          progress={{ current: summary.netPayoutPercent, max: 100 }}
          trend={summary.tripVolumeTrend}
          footnote={`Fleet Commission (${summary.commissionRatePercent}%): ${formatXaf(summary.commissionAmount)}`}
        />
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-heading text-xl text-text-primary">
              Settlement Breakdown
            </h3>
            {isTransactionsSample && <SampleDataBadge />}
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <Search
                aria-hidden="true"
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary"
              />
              <input
                type="text"
                placeholder="Filter by Driver..."
                className="w-full md:w-64 pl-10 pr-4 py-3 rounded-xl border border-border bg-surface-bright focus:border-primary focus:ring-1 focus:ring-primary outline-none font-sans transition-all"
              />
            </div>
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-3 rounded-xl border border-border bg-surface-bright hover:bg-surface-container transition-colors font-sans font-semibold"
            >
              <Calendar aria-hidden="true" className="h-4 w-4" />
              Date Range
            </button>
            <button
              type="button"
              aria-label="Filter settlements"
              className="p-3 rounded-xl border border-border bg-surface-bright hover:bg-surface-container transition-colors"
            >
              <SlidersHorizontal aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container/50 text-text-secondary font-mono uppercase text-xs">
                  <th scope="col" className="px-6 py-4">
                    Driver Name
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Trip ID
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Gross Amount
                  </th>
                  <th scope="col" className="px-6 py-4 text-right">
                    Owner Net ({summary.netPayoutPercent}%)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {transactions.map((trx) => {
                  const meta = STATUS_META[trx.status];
                  return (
                    <tr
                      key={trx.id}
                      className="hover:bg-surface-container transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            aria-hidden="true"
                            className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-xs font-bold shrink-0"
                          >
                            {trx.driverInitials}
                          </div>
                          <span className="font-sans font-semibold text-text-primary">
                            {trx.driverName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-text-secondary">
                        {trx.tripId}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-[10px] ${meta.className}`}
                        >
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-text-primary">
                        {formatXaf(trx.grossAmount)}
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-primary font-bold">
                        {formatXaf(trx.ownerNetAmount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-border bg-surface-container/30 flex justify-between items-center">
            <span className="font-sans text-sm text-text-secondary">
              Showing {transactions.length} of {transactions.length}{' '}
              transactions
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                aria-label="Previous page"
                disabled
                className="p-2 rounded-lg border border-border disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft aria-hidden="true" className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Next page"
                disabled
                className="p-2 rounded-lg border border-border disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
