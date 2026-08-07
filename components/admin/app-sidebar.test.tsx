import { render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { AppSidebar } from './app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

const mockUsePathname = usePathname as jest.Mock;

function renderSidebar() {
  return render(
    <SidebarProvider>
      <AppSidebar />
    </SidebarProvider>,
  );
}

// The design (admin_fleet_approval_queue/code.html + screen.png) has
// exactly five nav items: Dashboard, Fleet Approvals, Driver Verification,
// Financial Oversight, Settings. Every href below must resolve to a real
// route on disk — see app/admin/{fleet-approvals,drivers,finance,settings}
// for the minimal placeholder pages backing the four that aren't live yet.
const EXPECTED_ITEMS = [
  { name: 'Dashboard', href: '/admin' },
  { name: 'Fleet Approvals', href: '/admin/fleet-approvals' },
  { name: 'Driver Verification', href: '/admin/drivers' },
  { name: 'Financial Oversight', href: '/admin/finance' },
  { name: 'Settings', href: '/admin/settings' },
];

describe('AppSidebar', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/admin');
  });

  it('renders the KmerCargo brand as a link back to the landing page, not the admin dashboard', () => {
    renderSidebar();
    expect(screen.getByRole('link', { name: /kmercargo/i })).toHaveAttribute(
      'href',
      '/',
    );
  });

  it('renders the shared Truck icon lockup, not the old "K" letter badge', () => {
    renderSidebar();
    const link = screen.getByRole('link', { name: /kmercargo/i });
    expect(link.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
    expect(screen.queryByText('K', { exact: true })).not.toBeInTheDocument();
  });

  it('renders the brand at the smaller "sm" size so it sits comfortably in the compact sidebar header row', () => {
    renderSidebar();
    const link = screen.getByRole('link', { name: /kmercargo/i });
    expect(link.querySelector('svg')).toHaveClass('h-5', 'w-5');
    expect(screen.getByText('KmerCargo')).toHaveClass('text-xl');
  });

  it('renders exactly the five navigation items the design specifies, each linking to a real route, with a visible text label', () => {
    renderSidebar();
    const nav = screen.getByRole('navigation');
    const links = screen
      .getAllByRole('link')
      .filter((link) => nav.contains(link));

    expect(links).toHaveLength(EXPECTED_ITEMS.length);

    EXPECTED_ITEMS.forEach(({ name, href }) => {
      const link = screen.getByRole('link', { name });
      expect(link).toHaveAttribute('href', href);
      expect(link).toHaveTextContent(name);
    });
  });

  it('pairs every nav icon with an aria-hidden svg, never an unlabelled icon-only link', () => {
    renderSidebar();
    const nav = screen.getByRole('navigation');
    const links = screen
      .getAllByRole('link')
      .filter((link) => nav.contains(link));

    links.forEach((link) => {
      expect(link.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
      expect(link.textContent).not.toBe('');
    });
  });

  it('marks the active route with aria-current="page" and does not rely on colour alone', () => {
    mockUsePathname.mockReturnValue('/admin/fleet-approvals');
    renderSidebar();

    const activeLink = screen.getByRole('link', { name: 'Fleet Approvals' });
    expect(activeLink).toHaveAttribute('aria-current', 'page');
    // A visible non-colour signal (bold weight) accompanies the colour cue.
    expect(activeLink.className).toMatch(/font-semibold|font-bold/);

    const inactiveLink = screen.getByRole('link', { name: 'Dashboard' });
    expect(inactiveLink).not.toHaveAttribute('aria-current');
  });

  it('treats /admin as active only on an exact match, not as a prefix of every other admin route', () => {
    mockUsePathname.mockReturnValue('/admin/drivers');
    renderSidebar();

    expect(
      screen.getByRole('link', { name: 'Dashboard' }),
    ).not.toHaveAttribute('aria-current');
    expect(
      screen.getByRole('link', { name: 'Driver Verification' }),
    ).toHaveAttribute('aria-current', 'page');
  });

  it('keeps a nested route under a section active, e.g. a driver detail page keeps Driver Verification active', () => {
    mockUsePathname.mockReturnValue('/admin/drivers/driver-123');
    renderSidebar();

    expect(
      screen.getByRole('link', { name: 'Driver Verification' }),
    ).toHaveAttribute('aria-current', 'page');
  });
});
