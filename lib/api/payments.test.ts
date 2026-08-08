import {
  getWallet,
  getSettlements,
  getRevenueSummary,
  getSettlementTransactions,
} from './payments';
import { apiRequest } from './client';
import {
  WALLET_FIXTURE,
  SETTLEMENTS_FIXTURE,
  REVENUE_SUMMARY_FIXTURE,
  SETTLEMENT_TRANSACTIONS_FIXTURE,
} from './fixtures/payments';

jest.mock('./client');
const mockedRequest = apiRequest as jest.MockedFunction<typeof apiRequest>;

beforeEach(() => mockedRequest.mockReset());

describe('getWallet', () => {
  it('resolves the wallet fixture', async () => {
    await expect(getWallet('jwt-abc')).resolves.toEqual(WALLET_FIXTURE);
  });

  it('never calls apiRequest — tripwire for when /payments/wallet ships', async () => {
    // apps/payments has no live routes yet. If this test ever fails, the
    // fixture must be deleted and getWallet rewired to call apiRequest.
    await getWallet('jwt-abc');
    expect(apiRequest).not.toHaveBeenCalled();
  });
});

describe('getSettlements', () => {
  it('resolves the settlements fixture', async () => {
    await expect(getSettlements('jwt-abc')).resolves.toEqual(
      SETTLEMENTS_FIXTURE,
    );
  });

  it('never calls apiRequest — tripwire for when /payments/settlements ships', async () => {
    await getSettlements('jwt-abc');
    expect(apiRequest).not.toHaveBeenCalled();
  });
});

describe('getRevenueSummary', () => {
  it('resolves the revenue summary fixture', async () => {
    await expect(getRevenueSummary('jwt-abc')).resolves.toEqual(
      REVENUE_SUMMARY_FIXTURE,
    );
  });

  it('never calls apiRequest — tripwire for when a real revenue-summary endpoint ships', async () => {
    await getRevenueSummary('jwt-abc');
    expect(apiRequest).not.toHaveBeenCalled();
  });
});

describe('getSettlementTransactions', () => {
  it('resolves the settlement transactions fixture', async () => {
    await expect(getSettlementTransactions('jwt-abc')).resolves.toEqual(
      SETTLEMENT_TRANSACTIONS_FIXTURE,
    );
  });

  it('never calls apiRequest — tripwire for when a real settlement-transactions endpoint ships', async () => {
    await getSettlementTransactions('jwt-abc');
    expect(apiRequest).not.toHaveBeenCalled();
  });
});
