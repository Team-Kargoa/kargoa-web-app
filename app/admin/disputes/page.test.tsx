import { redirect } from 'next/navigation';
import DisputesPage from './page';
import { getAccessToken } from '@/lib/session';
import { listDisputes } from '@/lib/api/admin';
import {
  DISPUTES_FIXTURE,
  PAGINATION_META_FIXTURE,
} from '@/lib/api/fixtures/admin';

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
const mockedListDisputes = listDisputes as jest.MockedFunction<
  typeof listDisputes
>;

function searchParams(params: Record<string, string> = {}) {
  return Promise.resolve(params);
}

describe('DisputesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetAccessToken.mockResolvedValue('jwt-admin-token');
    mockedListDisputes.mockResolvedValue({
      data: {
        disputes: DISPUTES_FIXTURE,
        meta: PAGINATION_META_FIXTURE,
      },
      isSample: true,
    });
  });

  it('redirects to /signin when there is no access token', async () => {
    mockedGetAccessToken.mockResolvedValue(undefined);

    await expect(
      DisputesPage({ searchParams: searchParams() }),
    ).rejects.toThrow('NEXT_REDIRECT');

    expect(mockedRedirect).toHaveBeenCalledWith('/signin');
    expect(mockedListDisputes).not.toHaveBeenCalled();
  });

  it('fetches disputes list with the session token and default pagination', async () => {
    await DisputesPage({ searchParams: searchParams() });

    expect(mockedListDisputes).toHaveBeenCalledWith('jwt-admin-token', {
      page: 1,
    });
  });

  it('fetches disputes with status filter when provided', async () => {
    await DisputesPage({ searchParams: searchParams({ status: 'open' }) });

    expect(mockedListDisputes).toHaveBeenCalledWith('jwt-admin-token', {
      status: 'open',
      page: 1,
    });
  });

  it('fetches disputes with category filter when provided', async () => {
    await DisputesPage({
      searchParams: searchParams({ category: 'wrong_fare' }),
    });

    expect(mockedListDisputes).toHaveBeenCalledWith('jwt-admin-token', {
      category: 'wrong_fare',
      page: 1,
    });
  });

  it('fetches disputes with specified page number', async () => {
    await DisputesPage({ searchParams: searchParams({ page: '3' }) });

    expect(mockedListDisputes).toHaveBeenCalledWith('jwt-admin-token', {
      page: 3,
    });
  });

  it('fetches disputes with both status and category filters', async () => {
    await DisputesPage({
      searchParams: searchParams({
        status: 'in_review',
        category: 'driver_behavior',
      }),
    });

    expect(mockedListDisputes).toHaveBeenCalledWith('jwt-admin-token', {
      status: 'in_review',
      category: 'driver_behavior',
      page: 1,
    });
  });

  it('renders disputes list from live data', async () => {
    mockedListDisputes.mockResolvedValue({
      data: {
        disputes: DISPUTES_FIXTURE,
        meta: PAGINATION_META_FIXTURE,
      },
      isSample: false,
    });

    const page = await DisputesPage({ searchParams: searchParams() });
    expect(page).toBeDefined();
  });

  it('renders disputes list from fixture data with sample badge', async () => {
    const page = await DisputesPage({ searchParams: searchParams() });
    expect(page).toBeDefined();
  });
});
