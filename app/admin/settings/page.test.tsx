import { render, screen } from '@testing-library/react';
import { redirect } from 'next/navigation';
import AdminSettingsPage from './page';
import { getAccessToken } from '@/lib/session';
import { listPlatformConfigs } from '@/lib/api/admin';
import type { PlatformConfig } from '@/lib/api/admin';

jest.mock('next/navigation', () => ({
  redirect: jest.fn(() => {
    throw new Error('NEXT_REDIRECT');
  }),
}));
jest.mock('@/lib/session');
jest.mock('@/lib/api/admin');
// PlatformConfigForm has its own dedicated coverage in
// platform-config-form.test.tsx — stub it here so this page test stays
// focused on data wiring instead of duplicating that coverage.
jest.mock('./platform-config-form', () => ({
  PlatformConfigForm: ({ config }: { config: PlatformConfig }) => (
    <li data-testid="config-row">{config.key}</li>
  ),
}));

const mockedRedirect = redirect as jest.MockedFunction<typeof redirect>;
const mockedGetAccessToken = getAccessToken as jest.MockedFunction<
  typeof getAccessToken
>;
const mockedListPlatformConfigs = listPlatformConfigs as jest.MockedFunction<
  typeof listPlatformConfigs
>;

const CONFIGS: PlatformConfig[] = [
  {
    key: 'max_active_trips',
    value: '5',
    value_type: 'integer',
    description: 'Max concurrent active trips per driver',
    updated_at: '2026-08-01T10:00:00Z',
    updated_by: null,
  },
  {
    key: 'commission_rate',
    value: '0.15',
    value_type: 'decimal',
    description: 'Platform commission rate',
    updated_at: '2026-07-15T08:30:00Z',
    updated_by: '+237691234567',
  },
];

describe('AdminSettingsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetAccessToken.mockResolvedValue('jwt-abc');
    mockedListPlatformConfigs.mockResolvedValue(CONFIGS);
  });

  it('redirects to /signin without calling the API when there is no session token', async () => {
    mockedGetAccessToken.mockResolvedValue(undefined);

    await expect(AdminSettingsPage()).rejects.toThrow('NEXT_REDIRECT');

    expect(mockedRedirect).toHaveBeenCalledWith('/signin');
    expect(mockedListPlatformConfigs).not.toHaveBeenCalled();
  });

  it('fetches configs with the session token', async () => {
    render(await AdminSettingsPage());
    expect(mockedListPlatformConfigs).toHaveBeenCalledWith('jwt-abc');
  });

  it('renders the Platform Settings heading', async () => {
    render(await AdminSettingsPage());
    expect(
      screen.getByRole('heading', { name: 'Platform Settings' }),
    ).toBeInTheDocument();
  });

  it('renders a row per config', async () => {
    render(await AdminSettingsPage());
    const rows = screen.getAllByTestId('config-row');
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent('max_active_trips');
    expect(rows[1]).toHaveTextContent('commission_rate');
  });

  it('renders an empty state when there are no configs', async () => {
    mockedListPlatformConfigs.mockResolvedValue([]);
    render(await AdminSettingsPage());
    expect(
      screen.getByText(/no platform configuration values are available/i),
    ).toBeInTheDocument();
    expect(screen.queryByTestId('config-row')).not.toBeInTheDocument();
  });
});
