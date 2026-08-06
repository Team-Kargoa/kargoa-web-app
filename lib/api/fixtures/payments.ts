// Fixture data for lib/api/payments.ts. apps/payments has no live routes
// yet (verified 2026-08-04) — this file stands in for real API responses,
// shaped to api_spec.yaml. Delete alongside payments.ts once the backend
// ships /payments/wallet and /payments/settlements.
import type { Wallet, Settlement } from '../payments';

export const WALLET_FIXTURE: Wallet = {
  balance: '1240000.00',
  pending: '85000.00',
  currency: 'XAF',
};

export const SETTLEMENTS_FIXTURE: Settlement[] = [
  { id: 'stl-1', period: '2026-06', amount: '540000.00', status: 'paid' },
  { id: 'stl-2', period: '2026-07', amount: '610000.00', status: 'paid' },
  { id: 'stl-3', period: '2026-08', amount: '210000.00', status: 'pending' },
];
