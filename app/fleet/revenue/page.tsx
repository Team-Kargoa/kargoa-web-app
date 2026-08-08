import { redirect } from 'next/navigation';
import { getAccessToken } from '@/lib/session';
import {
  getRevenueSummary,
  getSettlementTransactions,
} from '@/lib/api/payments';
import { RevenueBreakdown } from '@/components/fleet/revenue-breakdown';

export default async function FleetRevenuePage() {
  // app/fleet/layout.tsx already gates this whole tree on a signed-in
  // fleet_owner; this is defence in depth, same as app/admin's pages, and
  // makes a missing token structurally impossible rather than papered
  // over with `?? ''` (which turned a 401 into a fixture fallback).
  const token = await getAccessToken();
  if (!token) redirect('/signin');

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
