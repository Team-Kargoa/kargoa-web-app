import { redirect } from 'next/navigation';
import AdminPage from './page';
import { getAccessToken } from '@/lib/session';
import { getOverview } from '@/lib/api/admin';
import { OVERVIEW_FIXTURE } from '@/lib/api/fixtures/admin';
import { DashboardOverview } from '@/components/admin/dashboard-overview';

// Blocking finding 3 (final whole-branch review): getOverview() exists,
// returns Sourced<AdminOverview>, has a fixture and tests — and was never
// called. AdminPage rendered DashboardOverview with zero props and every
// number on the dashboard was a hardcoded literal. This wires the real
// (or fixture-fallback) data through.
jest.mock('next/navigation', () => ({
  redirect: jest.fn(() => {
    throw new Error('NEXT_REDIRECT');
  }),
}));
jest.mock('@/lib/session');
jest.mock('@/lib/api/admin');
jest.mock('@/components/admin/dashboard-overview', () => ({
  DashboardOverview: jest.fn(() => null),
}));

const mockedRedirect = redirect as jest.MockedFunction<typeof redirect>;
const mockedGetAccessToken = getAccessToken as jest.MockedFunction<
  typeof getAccessToken
>;
const mockedGetOverview = getOverview as jest.MockedFunction<
  typeof getOverview
>;

describe('AdminPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetAccessToken.mockResolvedValue('jwt-abc');
    mockedGetOverview.mockResolvedValue({
      data: OVERVIEW_FIXTURE,
      isSample: true,
    });
  });

  it('redirects to /signin when there is no access token, without calling getOverview', async () => {
    mockedGetAccessToken.mockResolvedValue(undefined);

    await expect(AdminPage()).rejects.toThrow('NEXT_REDIRECT');

    expect(mockedRedirect).toHaveBeenCalledWith('/signin');
    expect(mockedGetOverview).not.toHaveBeenCalled();
  });

  it('fetches the overview with the session token', async () => {
    await AdminPage();
    expect(mockedGetOverview).toHaveBeenCalledWith('jwt-abc');
  });

  it('passes the overview data and sample flag through to DashboardOverview', async () => {
    const page = await AdminPage();
    expect(page.type).toBe(DashboardOverview);
    expect(page.props).toEqual({
      overview: OVERVIEW_FIXTURE,
      isSample: true,
    });
  });

  it('passes isSample: false through when the overview is live data', async () => {
    mockedGetOverview.mockResolvedValue({
      data: OVERVIEW_FIXTURE,
      isSample: false,
    });
    const page = await AdminPage();
    expect(page.props).toMatchObject({ isSample: false });
  });
});
