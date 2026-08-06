// FIXTURE-BACKED. apps/payments has no routes yet (verified 2026-08-04).
// When /payments/wallet ships, replace these bodies with apiRequest calls.
// Signatures must not change — screens depend on them.

import { WALLET_FIXTURE, SETTLEMENTS_FIXTURE } from './fixtures/payments';

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
