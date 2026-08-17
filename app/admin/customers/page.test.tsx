import { redirect } from 'next/navigation';
import CustomersPage from './page';
import { getAccessToken } from '@/lib/session';
import { listCustomers } from '@/lib/api/admin';
import {
  CUSTOMERS_FIXTURE,
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
const mockedListCustomers = listCustomers as jest.MockedFunction<
  typeof listCustomers
>;

function searchParams(params: Record<string, string> = {}) {
  return Promise.resolve(params);
}

describe('CustomersPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetAccessToken.mockResolvedValue('jwt-admin-token');
    mockedListCustomers.mockResolvedValue({
      data: {
        users: CUSTOMERS_FIXTURE,
        meta: PAGINATION_META_FIXTURE,
      },
      isSample: true,
    });
  });

  it('redirects to /signin when there is no access token', async () => {
    mockedGetAccessToken.mockResolvedValue(undefined);

    await expect(
      CustomersPage({ searchParams: searchParams() }),
    ).rejects.toThrow('NEXT_REDIRECT');

    expect(mockedRedirect).toHaveBeenCalledWith('/signin');
    expect(mockedListCustomers).not.toHaveBeenCalled();
  });

  it('fetches customers list with the session token and default pagination', async () => {
    await CustomersPage({ searchParams: searchParams() });

    expect(mockedListCustomers).toHaveBeenCalledWith('jwt-admin-token', {
      page: 1,
      search: undefined,
    });
  });

  it('fetches customers with search parameter when provided', async () => {
    await CustomersPage({ searchParams: searchParams({ search: 'Alice' }) });

    expect(mockedListCustomers).toHaveBeenCalledWith('jwt-admin-token', {
      page: 1,
      search: 'Alice',
    });
  });

  it('fetches customers with specified page number', async () => {
    await CustomersPage({ searchParams: searchParams({ page: '2' }) });

    expect(mockedListCustomers).toHaveBeenCalledWith('jwt-admin-token', {
      page: 2,
      search: undefined,
    });
  });

  it('renders customer list from live data', async () => {
    mockedListCustomers.mockResolvedValue({
      data: {
        users: CUSTOMERS_FIXTURE,
        meta: PAGINATION_META_FIXTURE,
      },
      isSample: false,
    });

    const page = await CustomersPage({ searchParams: searchParams() });
    expect(page).toBeDefined();
  });

  it('renders customer list from fixture data with sample badge', async () => {
    const page = await CustomersPage({ searchParams: searchParams() });
    expect(page).toBeDefined();
  });
});
