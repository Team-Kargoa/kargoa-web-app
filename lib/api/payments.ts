// LIVE-WITH-FALLBACK. apps/payments has no routes yet (verified
// 2026-08-04) — every function below attempts its guessed /payments/*
// path via withFallback and only falls back to its fixture when that call
// errors or returns something empty. The fixture disappears on its own,
// with no code change needed here, the moment apps/payments actually
// serves the route. Signatures now return Sourced<T> (`{ data, isSample }`)
// instead of T — callers must read `.data` and may read `.isSample` to
// show that a section is showing sample data.

import { apiRequest } from './client';
import { withFallback, type Sourced } from './with-fallback';
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

export function getWallet(token: string): Promise<Sourced<Wallet>> {
  return withFallback(
    () => apiRequest<Wallet>('/payments/wallet', { token }),
    WALLET_FIXTURE,
  );
}

export function getSettlements(
  token: string,
): Promise<Sourced<Settlement[]>> {
  return withFallback(
    () => apiRequest<Settlement[]>('/payments/settlements', { token }),
    SETTLEMENTS_FIXTURE,
  );
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

export function getRevenueSummary(
  token: string,
): Promise<Sourced<RevenueSummary>> {
  return withFallback(
    () =>
      apiRequest<RevenueSummary>('/payments/revenue-summary', { token }),
    REVENUE_SUMMARY_FIXTURE,
  );
}

export function getSettlementTransactions(
  token: string,
): Promise<Sourced<SettlementTransaction[]>> {
  return withFallback(
    () =>
      apiRequest<SettlementTransaction[]>(
        '/payments/settlement-transactions',
        { token },
      ),
    SETTLEMENT_TRANSACTIONS_FIXTURE,
  );
}
