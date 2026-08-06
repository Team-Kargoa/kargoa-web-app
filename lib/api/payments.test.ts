import { getWallet, getSettlements } from './payments';
import { apiRequest } from './client';
import { WALLET_FIXTURE, SETTLEMENTS_FIXTURE } from './fixtures/payments';

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
