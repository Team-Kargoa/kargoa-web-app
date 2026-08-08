import { render, screen, within } from '@testing-library/react';
import { DashboardOverview } from './dashboard-overview';
import type { AdminOverview } from '@/lib/api/admin';

// Blocking finding 3 (final whole-branch review): every number on this page
// used to be hardcoded even though getOverview() exists, is wired up
// elsewhere, and returns Sourced<AdminOverview> — it was simply never
// called. Worse, the old badge condition (`!stat.href`) tied "Sample data"
// to whether a card links somewhere, not whether its data is real: the two
// cards that DO link ("Pending Driver Approvals: 24", "Online Drivers:
// 328") rendered with no badge at all, reading as live platform state.
//
// The fix threads getOverview()'s { data, isSample } down as props. Five
// stat cards (pending_approvals, online_drivers, active_trips,
// revenue_last_24h_fcfa, open_disputes) come from AdminOverview and share
// one page-level Sample data badge keyed off `isSample`. "Pending Vehicle
// Approvals" has no matching AdminOverview field — it stays hardcoded but
// carries its own explicit, always-on badge, same as every other section
// on the page whose shape (named approvals, a payout list, a revenue
// chart, platform-health percentages) simply isn't part of AdminOverview
// and so can never stop being sample data.

const OVERVIEW: AdminOverview = {
  active_trips: 47,
  online_drivers: 132,
  bookings_last_24h: 286,
  revenue_last_24h_fcfa: 5297250,
  open_disputes: 3,
  pending_approvals: 28,
  as_of: '2026-08-07T09:00:00Z',
};

const OVERVIEW_BACKED_STATS = [
  { label: 'Pending Driver Approvals', value: '28', href: '/admin/drivers' },
  { label: 'Online Drivers', value: '132', href: '/admin/drivers' },
  { label: 'Active Trips', value: '47', href: undefined },
  { label: 'Today’s Revenue', value: '5,297,250 XAF', href: undefined },
  { label: 'Open Disputes', value: '3', href: undefined },
];

// Sections whose shape simply is not part of AdminOverview (no vehicle
// count, no named-approvals feed, no chart series, no health percentages,
// no transaction ledger) and so are hardcoded regardless of `isSample` —
// each must carry its own always-on badge.
const ALWAYS_SAMPLE_SECTION_HEADINGS = [
  'Revenue overview',
  'Platform health',
  'Trip volume',
  'Pending approvals',
  'Recent activity',
  'Recent transactions',
];

function renderOverview(isSample: boolean) {
  return render(<DashboardOverview overview={OVERVIEW} isSample={isSample} />);
}

describe('DashboardOverview', () => {
  describe.each(OVERVIEW_BACKED_STATS)(
    '"$label" stat card (sourced from AdminOverview)',
    ({ label, value, href }) => {
      it('renders the value from the overview prop, not a hardcoded number', () => {
        renderOverview(false);
        expect(screen.getByText(label)).toBeInTheDocument();
        expect(screen.getByText(value)).toBeInTheDocument();
      });

      if (href) {
        it(`stays a real link to ${href}`, () => {
          renderOverview(false);
          const link = screen.getByRole('link', { name: new RegExp(label) });
          expect(link).toHaveAttribute('href', href);
        });
      } else {
        it('is not rendered as a link', () => {
          renderOverview(false);
          expect(
            screen.queryByRole('link', { name: new RegExp(label) }),
          ).not.toBeInTheDocument();
        });
      }
    },
  );

  it('formats the revenue stat through formatXaf, not a hand-rolled literal like "XAF 2.48M"', () => {
    renderOverview(false);
    expect(screen.getByText('5,297,250 XAF')).toBeInTheDocument();
    expect(screen.queryByText(/XAF 2\.48M/)).not.toBeInTheDocument();
  });

  it('shows exactly one page-level Sample data badge for the overview-backed stat grid when isSample is true', () => {
    renderOverview(true);
    const grid = screen
      .getByText('Pending Driver Approvals')
      .closest('section') as HTMLElement;
    // Pending Vehicle Approvals' own always-on badge lives in this grid
    // too, so the overview-backed group's badge is the ONE outside that
    // card — i.e. two badges total in the grid, not six.
    expect(within(grid).getAllByText('Sample data')).toHaveLength(2);
  });

  it('shows no page-level badge for the overview-backed stats when isSample is false, but keeps Pending Vehicle Approvals badged', () => {
    renderOverview(false);
    const grid = screen
      .getByText('Pending Driver Approvals')
      .closest('section') as HTMLElement;
    expect(within(grid).getAllByText('Sample data')).toHaveLength(1);

    const vehicleCard = screen
      .getByText('Pending Vehicle Approvals')
      .closest('[aria-disabled="true"]') as HTMLElement;
    expect(within(vehicleCard).getByText('Sample data')).toBeInTheDocument();
  });

  it('renders "Pending Vehicle Approvals" as non-interactive with its own badge (no AdminOverview field backs it)', () => {
    renderOverview(false);
    expect(
      screen.queryByRole('link', { name: /Pending Vehicle Approvals/ }),
    ).not.toBeInTheDocument();
    const card = screen
      .getByText('Pending Vehicle Approvals')
      .closest('[aria-disabled="true"]');
    expect(card).not.toBeNull();
  });

  describe.each(ALWAYS_SAMPLE_SECTION_HEADINGS)(
    '"%s" section (no matching AdminOverview field, always sample)',
    (heading) => {
      it('carries its own Sample data badge even when the overview is real (isSample: false)', () => {
        renderOverview(false);
        const headingEl = screen.getByText(heading);
        const card = headingEl.closest('[data-slot="card"]') as HTMLElement;
        expect(within(card).getByText('Sample data')).toBeInTheDocument();
      });
    },
  );

  it('keeps the hero "Review approvals" CTA pointing at /admin/drivers', () => {
    renderOverview(false);
    expect(
      screen.getByRole('link', { name: 'Review approvals' }),
    ).toHaveAttribute('href', '/admin/drivers');
  });

  it('keeps the "Pending approvals" card\'s "View all" link pointing at /admin/drivers', () => {
    renderOverview(false);
    const heading = screen.getByText('Pending approvals');
    const card = heading.closest('[data-slot="card"]') as HTMLElement;
    const link = within(card).getByRole('link', { name: 'View all' });
    expect(link).toHaveAttribute('href', '/admin/drivers');
  });

  it('renders the "Recent transactions" card\'s "View all" as non-interactive, not a link to /admin/payments', () => {
    renderOverview(false);
    const heading = screen.getByText('Recent transactions');
    const card = heading.closest('[data-slot="card"]') as HTMLElement;

    expect(
      within(card).queryByRole('link', { name: 'View all' }),
    ).not.toBeInTheDocument();
    const viewAllButton = within(card).getByText('View all');
    expect(viewAllButton.tagName).toBe('BUTTON');
    expect(viewAllButton).toBeDisabled();
  });

  it('renders no links to /admin/payments anywhere on the page', () => {
    renderOverview(false);
    const paymentsLinks = screen
      .getAllByRole('link')
      .filter((link) => link.getAttribute('href') === '/admin/payments');
    expect(paymentsLinks).toHaveLength(0);
  });

  it("derives the greeting date from the overview's as_of timestamp instead of a hardcoded, now-stale date", () => {
    renderOverview(false);
    // as_of is 2026-08-07T09:00:00Z — a Friday.
    expect(screen.getByText('Friday, August 7, 2026')).toBeInTheDocument();
    expect(screen.queryByText('Monday, July 27, 2026')).not.toBeInTheDocument();
  });

  it('pairs every stat icon with a visible text label and hides the icon from assistive tech', () => {
    renderOverview(false);
    for (const { label } of OVERVIEW_BACKED_STATS) {
      const labelEl = screen.getByText(label);
      const card = (labelEl.closest('[aria-disabled="true"]') ??
        labelEl.closest('a')) as HTMLElement;
      const icon = card.querySelector('svg');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    }
  });
});
