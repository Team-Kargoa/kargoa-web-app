import { render, screen, within } from '@testing-library/react';
import { DashboardOverview } from './dashboard-overview';

// components/admin/app-sidebar.tsx already established the precedent for
// this project: a stat/nav item with no backing endpoint renders as a
// non-interactive, aria-disabled element rather than a link to a route that
// doesn't exist on disk (app/admin/vehicles, app/admin/trips,
// app/admin/payments and app/admin/disputes are all absent — the Django
// admin_api app only exposes drivers, platform configs and audit logs).
// Four stat cards and one "View all" link point at those missing routes;
// this file locks down that they render their metric/text but are never
// links, and that the two genuinely-backed /admin/drivers links survive.

const UNBACKED_STATS = [
  { label: 'Pending Vehicle Approvals', value: '12' },
  { label: 'Active Trips', value: '186' },
  { label: 'Today’s Revenue', value: 'XAF 2.48M' },
  { label: 'Open Disputes', value: '4' },
];

const DRIVER_BACKED_STATS = [
  { label: 'Pending Driver Approvals', value: '24' },
  { label: 'Online Drivers', value: '328' },
];

describe('DashboardOverview', () => {
  describe.each(UNBACKED_STATS)(
    '"$label" stat card (no backend endpoint)',
    ({ label, value }) => {
      it('renders its label and value as visible text', () => {
        render(<DashboardOverview />);
        expect(screen.getByText(label)).toBeInTheDocument();
        expect(screen.getByText(value)).toBeInTheDocument();
      });

      it('is not rendered as a link to a route that does not exist', () => {
        render(<DashboardOverview />);
        expect(
          screen.queryByRole('link', { name: new RegExp(label) }),
        ).not.toBeInTheDocument();
      });

      it('is marked aria-disabled and carries the Sample data badge', () => {
        render(<DashboardOverview />);
        const labelEl = screen.getByText(label);
        const card = labelEl.closest('[aria-disabled="true"]');
        expect(card).not.toBeNull();
        expect(
          within(card as HTMLElement).getByText('Sample data'),
        ).toBeInTheDocument();
      });

      it('pairs its stat icon with a visible label and hides the icon from assistive tech', () => {
        render(<DashboardOverview />);
        const labelEl = screen.getByText(label);
        const card = labelEl.closest('[aria-disabled="true"]') as HTMLElement;
        const icon = card.querySelector('svg');
        expect(icon).toHaveAttribute('aria-hidden', 'true');
      });
    },
  );

  describe.each(DRIVER_BACKED_STATS)(
    '"$label" stat card (backed by /admin/drivers)',
    ({ label, value }) => {
      it('renders its label and value', () => {
        render(<DashboardOverview />);
        expect(screen.getByText(label)).toBeInTheDocument();
        expect(screen.getByText(value)).toBeInTheDocument();
      });

      it('stays a real link to /admin/drivers', () => {
        render(<DashboardOverview />);
        const link = screen.getByRole('link', { name: new RegExp(label) });
        expect(link).toHaveAttribute('href', '/admin/drivers');
      });
    },
  );

  it('renders exactly two links in the stat-card grid — one per driver-backed card', () => {
    render(<DashboardOverview />);
    const grid = screen
      .getByText('Pending Driver Approvals')
      .closest('section') as HTMLElement;
    expect(within(grid).getAllByRole('link')).toHaveLength(2);
  });

  it('keeps the hero "Review approvals" CTA pointing at /admin/drivers', () => {
    render(<DashboardOverview />);
    expect(
      screen.getByRole('link', { name: 'Review approvals' }),
    ).toHaveAttribute('href', '/admin/drivers');
  });

  it('keeps the "Pending approvals" card\'s "View all" link pointing at /admin/drivers', () => {
    render(<DashboardOverview />);
    const heading = screen.getByText('Pending approvals');
    const card = heading.closest('[data-slot="card"]') as HTMLElement;
    const link = within(card).getByRole('link', { name: 'View all' });
    expect(link).toHaveAttribute('href', '/admin/drivers');
  });

  it('renders the "Recent transactions" card\'s "View all" as non-interactive, not a link to /admin/payments', () => {
    render(<DashboardOverview />);
    const heading = screen.getByText('Recent transactions');
    const card = heading.closest('[data-slot="card"]') as HTMLElement;

    expect(
      within(card).queryByRole('link', { name: 'View all' }),
    ).not.toBeInTheDocument();
    const viewAllButton = within(card).getByText('View all');
    expect(viewAllButton.tagName).toBe('BUTTON');
    expect(viewAllButton).toBeDisabled();
  });

  it('renders exactly two links total for /admin/payments-adjacent sections combined (none)', () => {
    render(<DashboardOverview />);
    const paymentsLinks = screen
      .getAllByRole('link')
      .filter((link) => link.getAttribute('href') === '/admin/payments');
    expect(paymentsLinks).toHaveLength(0);
  });
});
