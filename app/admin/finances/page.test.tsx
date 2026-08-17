import { redirect } from 'next/navigation';
import FinancesPage from './page';
import { getAccessToken } from '@/lib/session';
import { getFinancialOverview } from '@/lib/api/admin';
import { FINANCIAL_OVERVIEW_FIXTURE } from '@/lib/api/fixtures/admin';

jest.mock('next/navigation', () => ({
  redirect: jest.fn(() => {
    throw new Error('NEXT_REDIRECT');
  }),
}));

jest.mock('@/lib/session');
jest.mock('@/lib/api/admin');

const mockedRedirect = redirect as jest.MockedFunction<typeof redirect>;
const mockedGetAccessToken = getAccessToken as jest.MockedFunction<
  typeof getAccessToken
>;
const mockedGetFinancialOverview = getFinancialOverview as jest.MockedFunction<
  typeof getFinancialOverview
>;

describe('FinancesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedGetAccessToken.mockResolvedValue('jwt-admin-token');

    mockedGetFinancialOverview.mockResolvedValue({
      data: FINANCIAL_OVERVIEW_FIXTURE,
      isSample: true,
    });
  });

  it('redirects to /signin when there is no access token', async () => {
    mockedGetAccessToken.mockResolvedValue(undefined);

    await expect(FinancesPage()).rejects.toThrow('NEXT_REDIRECT');

    expect(mockedRedirect).toHaveBeenCalledWith('/signin');
    expect(mockedGetFinancialOverview).not.toHaveBeenCalled();
  });

  it('fetches financial overview with the session token', async () => {
    await FinancesPage();

    expect(mockedGetAccessToken).toHaveBeenCalledTimes(1);
    expect(mockedGetFinancialOverview).toHaveBeenCalledTimes(1);
    expect(mockedGetFinancialOverview).toHaveBeenCalledWith(
      'jwt-admin-token',
    );
  });

  it('renders the page successfully with financial data', async () => {
    const page = await FinancesPage();

    expect(page).toBeDefined();
    expect(page.type).toBe('main');
  });

  it('handles sample financial data', async () => {
    mockedGetFinancialOverview.mockResolvedValue({
      data: FINANCIAL_OVERVIEW_FIXTURE,
      isSample: true,
    });

    const page = await FinancesPage();

    expect(page).toBeDefined();
    expect(mockedGetFinancialOverview).toHaveBeenCalledWith(
      'jwt-admin-token',
    );
  });

  it('handles live financial data', async () => {
    mockedGetFinancialOverview.mockResolvedValue({
      data: FINANCIAL_OVERVIEW_FIXTURE,
      isSample: false,
    });

    const page = await FinancesPage();

    expect(page).toBeDefined();
    expect(mockedGetFinancialOverview).toHaveBeenCalledWith(
      'jwt-admin-token',
    );
  });
});