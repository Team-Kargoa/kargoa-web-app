import { render, screen } from '@testing-library/react';
import { redirect } from 'next/navigation';
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

jest.mock('next/navigation', () => ({
  redirect: jest.fn(() => {
    throw new Error('NEXT_REDIRECT');
  }),
}));
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

const mockedRedirect = redirect as jest.MockedFunction<typeof redirect>;
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
  mockedGetWallet.mockResolvedValue({ data: WALLET_FIXTURE, isSample: true });
  mockedGetFleetSummary.mockResolvedValue({
    data: FLEET_SUMMARY_FIXTURE,
    isSample: true,
  });
  mockedGetWeeklyPerformance.mockResolvedValue({
    data: WEEKLY_PERFORMANCE_FIXTURE,
    isSample: true,
  });
  mockedGetActiveDrivers.mockResolvedValue({
    data: ACTIVE_DRIVERS_FIXTURE,
    isSample: true,
  });
});

describe('FleetDashboardPage', () => {
  // The "Fleet Operations" heading and signed-in identity moved to
  // FleetHeader, rendered by app/fleet/layout.tsx — see
  // components/fleet/fleet-header.test.tsx and app/fleet/layout.test.tsx.
  // This page no longer renders a heading of its own.

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

  it('renders the performance chart section, not just the cards and table', async () => {
    // Regression guard: <PerformanceChart /> is rendered unconditionally in
    // the page, so deleting it changes no branch and coverage stays at
    // 100% — this must be asserted directly, not inferred.
    render(await FleetDashboardPage());
    expect(
      screen.getByRole('heading', { name: 'Fleet Performance' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Thu')).toBeInTheDocument();
  });

  it('renders the pending verifications count and its avatar initials', async () => {
    render(await FleetDashboardPage());
    expect(screen.getByText(/pending verifications/i)).toBeInTheDocument();
    expect(screen.getByText('03')).toBeInTheDocument();
    expect(screen.getByText('JD')).toBeInTheDocument();
    expect(screen.getByText('SM')).toBeInTheDocument();
    expect(screen.getByText('AA')).toBeInTheDocument();
  });

  // Issue 4: the page used to render its own second header underneath
  // FleetNav, with dead "Dashboard / Fleet / Reports" spans and a
  // hardcoded "AU" / "Admin Profile" / "Logistics Ops" chip shown to a
  // real signed-in fleet owner. That header (and the real user identity
  // + sign-out control that replaced it) now lives in app/fleet/layout.tsx
  // as FleetHeader — see components/fleet/fleet-header.test.tsx and
  // app/fleet/layout.test.tsx.
  it('renders no second header of its own — FleetNav and the layout-level FleetHeader are the only chrome', async () => {
    render(await FleetDashboardPage());
    expect(screen.queryByText('Admin Profile')).not.toBeInTheDocument();
    expect(screen.queryByText('Logistics Ops')).not.toBeInTheDocument();
    expect(screen.queryAllByRole('banner')).toHaveLength(0);
  });

  it('fetches with the access token from the session', async () => {
    render(await FleetDashboardPage());
    expect(mockedGetWallet).toHaveBeenCalledWith('jwt-abc');
    expect(mockedGetFleetSummary).toHaveBeenCalledWith('jwt-abc');
    expect(mockedGetWeeklyPerformance).toHaveBeenCalledWith('jwt-abc');
    expect(mockedGetActiveDrivers).toHaveBeenCalledWith('jwt-abc');
  });

  it('redirects to /signin when there is no access token, without calling the API', async () => {
    mockedGetAccessToken.mockResolvedValue(undefined);

    await expect(FleetDashboardPage()).rejects.toThrow('NEXT_REDIRECT');

    expect(mockedRedirect).toHaveBeenCalledWith('/signin');
    expect(mockedGetWallet).not.toHaveBeenCalled();
  });

  it('shows a Sample data badge on every section when every source is sample data', async () => {
    render(await FleetDashboardPage());
    // Earnings StatCard, Active Trucks StatCard, Pending Verifications
    // StatCard, PerformanceChart, DriverTable.
    expect(screen.getAllByText('Sample data')).toHaveLength(5);
  });

  it('shows no Sample data badge when every source is real data', async () => {
    mockedGetWallet.mockResolvedValue({
      data: WALLET_FIXTURE,
      isSample: false,
    });
    mockedGetFleetSummary.mockResolvedValue({
      data: FLEET_SUMMARY_FIXTURE,
      isSample: false,
    });
    mockedGetWeeklyPerformance.mockResolvedValue({
      data: WEEKLY_PERFORMANCE_FIXTURE,
      isSample: false,
    });
    mockedGetActiveDrivers.mockResolvedValue({
      data: ACTIVE_DRIVERS_FIXTURE,
      isSample: false,
    });
    render(await FleetDashboardPage());
    expect(screen.queryByText('Sample data')).not.toBeInTheDocument();
  });

  it('shows the badge only on the sections still backed by sample data', async () => {
    mockedGetWallet.mockResolvedValue({
      data: WALLET_FIXTURE,
      isSample: false,
    });
    render(await FleetDashboardPage());
    // Fleet summary (2 cards), performance chart, driver table remain
    // sample; wallet-backed earnings card is now real.
    expect(screen.getAllByText('Sample data')).toHaveLength(4);
  });
});
