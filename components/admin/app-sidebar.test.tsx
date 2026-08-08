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

// The design (admin_fleet_approval_queue/code.html + screen.png) has five
// nav items, but only three have a real backend-backed screen behind them
// today (app/admin, app/admin/drivers, app/admin/settings — see task 4.3).
// Fleet Approvals and Financial Oversight have no backend endpoint
// (getFleetApplications/the payments module both fall back to fixtures), so
// they render as non-interactive labels rather than links to routes that
// don't exist — the same precedent already used for "Request Admin Access"
// on the sign-in page.
const LINKED_ITEMS = [
  { name: 'Dashboard', href: '/admin' },
  { name: 'Driver Verification', href: '/admin/drivers' },
  { name: 'Settings', href: '/admin/settings' },
];
const LABEL_ITEMS = ['Fleet Approvals', 'Financial Oversight'];

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

  it('renders exactly the five navigation items the design specifies, with a visible text label', () => {
    renderSidebar();
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveTextContent('Dashboard');
    expect(nav).toHaveTextContent('Fleet Approvals');
    expect(nav).toHaveTextContent('Driver Verification');
    expect(nav).toHaveTextContent('Financial Oversight');
    expect(nav).toHaveTextContent('Settings');
  });

  it('links every backed section to its real route on disk, each icon paired with an aria-hidden svg', () => {
    renderSidebar();
    const nav = screen.getByRole('navigation');
    const links = screen
      .getAllByRole('link')
      .filter((link) => nav.contains(link));

    expect(links).toHaveLength(LINKED_ITEMS.length);

    LINKED_ITEMS.forEach(({ name, href }) => {
      const link = screen.getByRole('link', { name });
      expect(link).toHaveAttribute('href', href);
      expect(link).toHaveTextContent(name);
      expect(link.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
    });
  });

  it('renders Fleet Approvals and Financial Oversight as non-interactive labels, never as links to a route that does not exist', () => {
    renderSidebar();

    LABEL_ITEMS.forEach((name) => {
      expect(screen.getByText(name)).toBeInTheDocument();
      expect(screen.queryByRole('link', { name })).not.toBeInTheDocument();
    });
  });

  it('marks the active route with aria-current="page" and does not rely on colour alone', () => {
    mockUsePathname.mockReturnValue('/admin/drivers');
    renderSidebar();

    const activeLink = screen.getByRole('link', {
      name: 'Driver Verification',
    });
    expect(activeLink).toHaveAttribute('aria-current', 'page');
    // A visible non-colour signal (bold weight) accompanies the colour cue.
    expect(activeLink.className).toMatch(/font-semibold|font-bold/);

    const inactiveLink = screen.getByRole('link', { name: 'Dashboard' });
    expect(inactiveLink).not.toHaveAttribute('aria-current');
  });

  it('treats /admin as active only on an exact match, not as a prefix of every other admin route', () => {
    mockUsePathname.mockReturnValue('/admin/drivers');
    renderSidebar();

    expect(screen.getByRole('link', { name: 'Dashboard' })).not.toHaveAttribute(
      'aria-current',
    );
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
