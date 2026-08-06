import { render, screen } from '@testing-library/react';
import FleetDashboardPage from './page';
import { getAccessToken } from '@/lib/session';
import { getWallet } from '@/lib/api/payments';
import {
  getFleetSummary,
  getWeeklyPerformance,
  getActiveDrivers,
} from '@/lib/api/fleet';
import {
  FLEET_SUMMARY_FIXTURE,
  WEEKLY_PERFORMANCE_FIXTURE,
  ACTIVE_DRIVERS_FIXTURE,
} from '@/lib/api/fixtures/fleet';
import { WALLET_FIXTURE } from '@/lib/api/fixtures/payments';

jest.mock('@/lib/session');
jest.mock('@/lib/api/payments');
jest.mock('@/lib/api/fleet');

// recharts does not render in jsdom — mocked to pass-through containers so
// PerformanceChart (rendered inside the page) doesn't blow up the test.
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  Bar: () => null,
  Cell: () => null,
  XAxis: () => null,
  Tooltip: () => null,
}));

const mockedGetAccessToken = getAccessToken as jest.MockedFunction<
  typeof getAccessToken
>;
const mockedGetWallet = getWallet as jest.MockedFunction<typeof getWallet>;
const mockedGetFleetSummary = getFleetSummary as jest.MockedFunction<
  typeof getFleetSummary
>;
const mockedGetWeeklyPerformance = getWeeklyPerformance as jest.MockedFunction<
  typeof getWeeklyPerformance
>;
const mockedGetActiveDrivers = getActiveDrivers as jest.MockedFunction<
  typeof getActiveDrivers
>;

beforeEach(() => {
  jest.clearAllMocks();
  mockedGetAccessToken.mockResolvedValue('jwt-abc');
  mockedGetWallet.mockResolvedValue(WALLET_FIXTURE);
  mockedGetFleetSummary.mockResolvedValue(FLEET_SUMMARY_FIXTURE);
  mockedGetWeeklyPerformance.mockResolvedValue(WEEKLY_PERFORMANCE_FIXTURE);
  mockedGetActiveDrivers.mockResolvedValue(ACTIVE_DRIVERS_FIXTURE);
});

describe('FleetDashboardPage', () => {
  it('renders the Fleet Operations heading', async () => {
    render(await FleetDashboardPage());
    expect(
      screen.getByRole('heading', { name: /fleet operations/i }),
    ).toBeInTheDocument();
  });

  it('renders the active trucks stat card', async () => {
    render(await FleetDashboardPage());
    expect(screen.getByText(/active trucks/i)).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
  });

  it('renders the earnings formatted through formatXaf', async () => {
    render(await FleetDashboardPage());
    expect(screen.getByText('1,240,000 XAF')).toBeInTheDocument();
  });

  it('renders the drivers table with a fixture driver', async () => {
    render(await FleetDashboardPage());
    expect(
      screen.getByRole('heading', { name: 'Active Drivers' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Jean-Paul N.')).toBeInTheDocument();
  });

  it('fetches with the access token from the session', async () => {
    render(await FleetDashboardPage());
    expect(mockedGetWallet).toHaveBeenCalledWith('jwt-abc');
    expect(mockedGetFleetSummary).toHaveBeenCalledWith('jwt-abc');
    expect(mockedGetWeeklyPerformance).toHaveBeenCalledWith('jwt-abc');
    expect(mockedGetActiveDrivers).toHaveBeenCalledWith('jwt-abc');
  });

  it('falls back to an empty token string when the session has none', async () => {
    mockedGetAccessToken.mockResolvedValue(undefined);
    render(await FleetDashboardPage());
    expect(mockedGetWallet).toHaveBeenCalledWith('');
  });
});
