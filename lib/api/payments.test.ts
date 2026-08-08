import {
  getWallet,
  getSettlements,
  getRevenueSummary,
  getSettlementTransactions,
} from './payments';
import { apiRequest, ApiError } from './client';
import {
  WALLET_FIXTURE,
  SETTLEMENTS_FIXTURE,
  REVENUE_SUMMARY_FIXTURE,
  SETTLEMENT_TRANSACTIONS_FIXTURE,
} from './fixtures/payments';

jest.mock('./client', () => ({
  __esModule: true,
  ...jest.requireActual('./client'),
  apiRequest: jest.fn(),
}));
const mockedRequest = apiRequest as jest.MockedFunction<typeof apiRequest>;

beforeEach(() => mockedRequest.mockReset());

describe('getWallet', () => {
  it('requests /payments/wallet and returns live data with isSample: false', async () => {
    const live = { ...WALLET_FIXTURE, balance: '999.00' };
    mockedRequest.mockResolvedValue(live);

    await expect(getWallet('jwt-abc')).resolves.toEqual({
      data: live,
      isSample: false,
    });
    expect(mockedRequest).toHaveBeenCalledWith('/payments/wallet', {
      token: 'jwt-abc',
    });
  });

  it('falls back to the wallet fixture with isSample: true when the endpoint 404s', async () => {
    mockedRequest.mockRejectedValue(new ApiError('Not found.', 404));

    await expect(getWallet('jwt-abc')).resolves.toEqual({
      data: WALLET_FIXTURE,
      isSample: true,
    });
  });
});

describe('getSettlements', () => {
  it('requests /payments/settlements and returns live data with isSample: false', async () => {
    const live = [SETTLEMENTS_FIXTURE[0]];
    mockedRequest.mockResolvedValue(live);

    await expect(getSettlements('jwt-abc')).resolves.toEqual({
      data: live,
      isSample: false,
    });
    expect(mockedRequest).toHaveBeenCalledWith('/payments/settlements', {
      token: 'jwt-abc',
    });
  });

  it('falls back to the settlements fixture with isSample: true when the endpoint 404s', async () => {
    mockedRequest.mockRejectedValue(new ApiError('Not found.', 404));

    await expect(getSettlements('jwt-abc')).resolves.toEqual({
      data: SETTLEMENTS_FIXTURE,
      isSample: true,
    });
  });

  it('falls back to the fixture with isSample: true when the endpoint returns an empty array', async () => {
    mockedRequest.mockResolvedValue([]);

    await expect(getSettlements('jwt-abc')).resolves.toEqual({
      data: SETTLEMENTS_FIXTURE,
      isSample: true,
    });
  });
});

describe('getRevenueSummary', () => {
  it('requests /payments/revenue-summary and returns live data with isSample: false', async () => {
    const live = { ...REVENUE_SUMMARY_FIXTURE, monthGross: '999.00' };
    mockedRequest.mockResolvedValue(live);

    await expect(getRevenueSummary('jwt-abc')).resolves.toEqual({
      data: live,
      isSample: false,
    });
    expect(mockedRequest).toHaveBeenCalledWith('/payments/revenue-summary', {
      token: 'jwt-abc',
    });
  });

  it('falls back to the revenue summary fixture with isSample: true when the endpoint 404s', async () => {
    mockedRequest.mockRejectedValue(new ApiError('Not found.', 404));

    await expect(getRevenueSummary('jwt-abc')).resolves.toEqual({
      data: REVENUE_SUMMARY_FIXTURE,
      isSample: true,
    });
  });
});

describe('getSettlementTransactions', () => {
  it('requests /payments/settlement-transactions and returns live data with isSample: false', async () => {
    const live = [SETTLEMENT_TRANSACTIONS_FIXTURE[0]];
    mockedRequest.mockResolvedValue(live);

    await expect(getSettlementTransactions('jwt-abc')).resolves.toEqual({
      data: live,
      isSample: false,
    });
    expect(mockedRequest).toHaveBeenCalledWith(
      '/payments/settlement-transactions',
      { token: 'jwt-abc' },
    );
  });

  it('falls back to the settlement transactions fixture with isSample: true when the endpoint 404s', async () => {
    mockedRequest.mockRejectedValue(new ApiError('Not found.', 404));

    await expect(getSettlementTransactions('jwt-abc')).resolves.toEqual({
      data: SETTLEMENT_TRANSACTIONS_FIXTURE,
      isSample: true,
    });
  });

  it('falls back to the fixture with isSample: true when the endpoint returns an empty array', async () => {
    mockedRequest.mockResolvedValue([]);

    await expect(getSettlementTransactions('jwt-abc')).resolves.toEqual({
      data: SETTLEMENT_TRANSACTIONS_FIXTURE,
      isSample: true,
    });
  });
});
