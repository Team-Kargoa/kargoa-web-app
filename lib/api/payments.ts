// FIXTURE-BACKED. apps/payments has no routes yet (verified 2026-08-04).
// When /payments/wallet ships, replace these bodies with apiRequest calls.
// Signatures must not change — screens depend on them.

import {
  WALLET_FIXTURE,
  SETTLEMENTS_FIXTURE,
  REVENUE_SUMMARY_FIXTURE,
  SETTLEMENT_TRANSACTIONS_FIXTURE,
} from './fixtures/payments';

export type Wallet = { balance: string; pending: string; currency: 'XAF' };
export type Settlement = {
  id: string;
  period: string;
  amount: string;
  status: 'paid' | 'pending';
};

export function getWallet(token: string): Promise<Wallet> {
  void token;
  return Promise.resolve(WALLET_FIXTURE);
}

export function getSettlements(token: string): Promise<Settlement[]> {
  void token;
  return Promise.resolve(SETTLEMENTS_FIXTURE);
}

// --- /fleet/revenue (Revenue Tracking & Settlements) ---
//
// fleet_owner_revenue_settlements shows a per-trip settlement breakdown
// (driver, trip ID, gross/net amounts) and a balance hero card, neither of
// which fit the period-based Settlement/Wallet shapes above — those back
// other screens and their signatures must not change. These are additive.

export type RevenueSummary = {
  availableBalance: string;
  monthGross: string;
  commissionRatePercent: number;
  commissionAmount: string;
  netPayoutPercent: number;
  tripVolumeTrend: string;
};

export type SettlementTransactionStatus = 'settled' | 'pending' | 'flagged';

export type SettlementTransaction = {
  id: string;
  driverName: string;
  driverInitials: string;
  tripId: string;
  status: SettlementTransactionStatus;
  grossAmount: string;
  ownerNetAmount: string;
};

export function getRevenueSummary(token: string): Promise<RevenueSummary> {
  void token;
  return Promise.resolve(REVENUE_SUMMARY_FIXTURE);
}

export function getSettlementTransactions(
  token: string,
): Promise<SettlementTransaction[]> {
  void token;
  return Promise.resolve(SETTLEMENT_TRANSACTIONS_FIXTURE);
}
