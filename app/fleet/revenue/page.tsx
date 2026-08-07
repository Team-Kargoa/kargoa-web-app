import { getAccessToken } from '@/lib/session';
import {
  getRevenueSummary,
  getSettlementTransactions,
} from '@/lib/api/payments';
import { RevenueBreakdown } from '@/components/fleet/revenue-breakdown';

export default async function FleetRevenuePage() {
  const token = (await getAccessToken()) ?? '';

  const [summary, transactions] = await Promise.all([
    getRevenueSummary(token),
    getSettlementTransactions(token),
  ]);

  return (
    <main className="p-4 md:p-8 pb-24 md:pb-8">
      <RevenueBreakdown
        summary={summary.data}
        transactions={transactions.data}
        isSummarySample={summary.isSample}
        isTransactionsSample={transactions.isSample}
      />
    </main>
  );
}
