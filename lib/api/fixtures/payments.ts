// Fixture data for lib/api/payments.ts. apps/payments has no live routes
// yet (verified 2026-08-04) — this file stands in for real API responses,
// shaped to api_spec.yaml. Delete alongside payments.ts once the backend
// ships /payments/wallet and /payments/settlements.
import type {
  Wallet,
  Settlement,
  RevenueSummary,
  SettlementTransaction,
} from '../payments';

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

// fleet_owner_revenue_settlements sample values, verbatim from its screen.png.
export const REVENUE_SUMMARY_FIXTURE: RevenueSummary = {
  availableBalance: '4820500.00',
  monthGross: '5297250.00',
  commissionRatePercent: 9,
  commissionAmount: '476750.00',
  netPayoutPercent: 91,
  tripVolumeTrend: '+12% vs last mo.',
};

export const SETTLEMENT_TRANSACTIONS_FIXTURE: SettlementTransaction[] = [
  {
    id: 'trx-1',
    driverName: 'Emanuel Kouassi',
    driverInitials: 'EK',
    tripId: 'KC-44921-Y',
    status: 'settled',
    grossAmount: '25000.00',
    ownerNetAmount: '22750.00',
  },
  {
    id: 'trx-2',
    driverName: 'Moussa Bello',
    driverInitials: 'MB',
    tripId: 'KC-44930-D',
    status: 'pending',
    grossAmount: '42500.00',
    ownerNetAmount: '38675.00',
  },
  {
    id: 'trx-3',
    driverName: "Clarisse N'golo",
    driverInitials: 'CN',
    tripId: 'KC-44938-Y',
    status: 'settled',
    grossAmount: '18200.00',
    ownerNetAmount: '16562.00',
  },
  {
    id: 'trx-4',
    driverName: 'Jean-Pierre Dikolo',
    driverInitials: 'JD',
    tripId: 'KC-44941-Y',
    status: 'flagged',
    grossAmount: '112000.00',
    ownerNetAmount: '101920.00',
  },
  {
    id: 'trx-5',
    driverName: 'Amadou M.',
    driverInitials: 'AM',
    tripId: 'KC-44944-D',
    status: 'settled',
    grossAmount: '8500.00',
    ownerNetAmount: '7735.00',
  },
];
