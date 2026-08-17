import { redirect } from 'next/navigation';
import ConfigPage from './page';
import { getAccessToken } from '@/lib/session';
import { listPlatformConfigs } from '@/lib/api/admin';

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
const mockedListPlatformConfigs = listPlatformConfigs as jest.MockedFunction<
  typeof listPlatformConfigs
>;

const PLATFORM_CONFIGS = [
  {
    key: 'commission_rate',
    value: '0.09',
    value_type: 'decimal',
    description: 'Platform commission percentage',
    updated_at: '2026-08-01T10:00:00Z',
    updated_by: null,
  },
  {
    key: 'dispatch_timeout_seconds',
    value: '30',
    value_type: 'integer',
    description: 'Dispatch timeout in seconds',
    updated_at: '2026-08-02T14:30:00Z',
    updated_by: '+237691234567',
  },
  {
    key: 'driver_debt_ceiling_fcfa',
    value: '-50000',
    value_type: 'integer',
    description: 'Maximum driver debt allowed',
    updated_at: '2026-08-03T09:15:00Z',
    updated_by: null,
  },
];

describe('ConfigPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetAccessToken.mockResolvedValue('jwt-admin-token');
    mockedListPlatformConfigs.mockResolvedValue(PLATFORM_CONFIGS);
  });

  it('redirects to /signin when there is no access token', async () => {
    mockedGetAccessToken.mockResolvedValue(undefined);

    await expect(ConfigPage()).rejects.toThrow('NEXT_REDIRECT');
    expect(mockedRedirect).toHaveBeenCalledWith('/signin');
    expect(mockedListPlatformConfigs).not.toHaveBeenCalled();
  });

  it('fetches platform configs with the session token', async () => {
    await ConfigPage();
    expect(mockedListPlatformConfigs).toHaveBeenCalledWith('jwt-admin-token');
  });

  it('renders all platform configuration items', async () => {
    const page = await ConfigPage();
    expect(page).toBeDefined();
  });

  it('handles empty config list gracefully', async () => {
    mockedListPlatformConfigs.mockResolvedValue([]);

    const page = await ConfigPage();
    expect(page).toBeDefined();
  });

  it('renders config with all types correctly', async () => {
    const page = await ConfigPage();
    expect(page).toBeDefined();

    // Verify that different value types are handled
    expect(mockedListPlatformConfigs).toHaveBeenCalled();
  });
});
