import { render, screen } from '@testing-library/react';
import FleetRevenuePage from './page';
import { getAccessToken } from '@/lib/session';
import {
  getRevenueSummary,
  getSettlementTransactions,
} from '@/lib/api/payments';
import {
  REVENUE_SUMMARY_FIXTURE,
  SETTLEMENT_TRANSACTIONS_FIXTURE,
} from '@/lib/api/fixtures/payments';

jest.mock('@/lib/session');
jest.mock('@/lib/api/payments');

const mockedGetAccessToken = getAccessToken as jest.MockedFunction<
  typeof getAccessToken
>;
const mockedGetRevenueSummary = getRevenueSummary as jest.MockedFunction<
  typeof getRevenueSummary
>;
const mockedGetSettlementTransactions =
  getSettlementTransactions as jest.MockedFunction<
    typeof getSettlementTransactions
  >;

beforeEach(() => {
  jest.clearAllMocks();
  mockedGetAccessToken.mockResolvedValue('jwt-abc');
  mockedGetRevenueSummary.mockResolvedValue(REVENUE_SUMMARY_FIXTURE);
  mockedGetSettlementTransactions.mockResolvedValue(
    SETTLEMENT_TRANSACTIONS_FIXTURE,
  );
});

describe('FleetRevenuePage', () => {
  it('renders the Revenue Tracking heading', async () => {
    render(await FleetRevenuePage());
    expect(
      screen.getByRole('heading', { name: 'Revenue Tracking' }),
    ).toBeInTheDocument();
  });

  it('renders the available balance formatted through formatXaf, in font-mono', async () => {
    render(await FleetRevenuePage());
    expect(screen.getByText(/available balance/i)).toBeInTheDocument();
    const balance = screen.getByText('4,820,500 XAF');
    expect(balance).toBeInTheDocument();
    expect(balance).toHaveClass('font-mono');
    expect(screen.getByText('91% Net Payout')).toBeInTheDocument();
  });

  it('renders the withdraw and history actions', async () => {
    render(await FleetRevenuePage());
    expect(
      screen.getByRole('button', { name: /withdraw to business momo/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /^history$/i }),
    ).toBeInTheDocument();
  });

  it("renders this month's gross, commission and trip volume trend", async () => {
    render(await FleetRevenuePage());
    expect(screen.getByText(/this month's gross/i)).toBeInTheDocument();
    expect(screen.getByText('5,297,250 XAF')).toBeInTheDocument();
    expect(screen.getByText(/fleet commission \(9%\)/i)).toBeInTheDocument();
    expect(screen.getByText('476,750 XAF')).toBeInTheDocument();
    expect(screen.getByText('+12% vs last mo.')).toBeInTheDocument();
  });

  it("renders this month's gross card through the shared StatCard component", async () => {
    render(await FleetRevenuePage());
    // Pins the fix-round-1 refactor: this card now goes through StatCard
    // rather than hand-rolled markup, so it inherits StatCard's label
    // treatment (uppercase, tracking-wider) instead of its old plain-case
    // styling.
    expect(screen.getByText("This Month's Gross")).toHaveClass('uppercase');
  });

  it('renders the Settlement Breakdown table with driver, trip id, status and amounts', async () => {
    render(await FleetRevenuePage());
    expect(
      screen.getByRole('heading', { name: 'Settlement Breakdown' }),
    ).toBeInTheDocument();

    expect(screen.getByText('Emanuel Kouassi')).toBeInTheDocument();
    const tripId = screen.getByText('KC-44921-Y');
    expect(tripId).toHaveClass('font-mono');
    expect(screen.getAllByText('SETTLED')).toHaveLength(3);
    expect(screen.getByText('PENDING')).toBeInTheDocument();
    expect(screen.getByText('FLAGGED')).toBeInTheDocument();

    const gross = screen.getByText('25,000 XAF');
    expect(gross).toHaveClass('font-mono');
    expect(screen.getByText('22,750 XAF')).toBeInTheDocument();
  });

  it('renders the filter-by-driver input and date range control', async () => {
    render(await FleetRevenuePage());
    expect(
      screen.getByPlaceholderText('Filter by Driver...'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /date range/i }),
    ).toBeInTheDocument();
  });

  it('shows the real transaction count rather than an invented total', async () => {
    render(await FleetRevenuePage());
    expect(screen.getByText('Showing 5 of 5 transactions')).toBeInTheDocument();
  });

  it('fetches revenue data with the access token from the session', async () => {
    render(await FleetRevenuePage());
    expect(mockedGetRevenueSummary).toHaveBeenCalledWith('jwt-abc');
    expect(mockedGetSettlementTransactions).toHaveBeenCalledWith('jwt-abc');
  });

  it('falls back to an empty token string when the session has none', async () => {
    mockedGetAccessToken.mockResolvedValue(undefined);
    render(await FleetRevenuePage());
    expect(mockedGetRevenueSummary).toHaveBeenCalledWith('');
  });
});
