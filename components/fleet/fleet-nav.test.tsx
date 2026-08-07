import {
  render,
  screen,
  within,
  fireEvent,
  waitFor,
} from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { FleetNav } from './fleet-nav';
import { signOut } from '@/app/(auth)/actions';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));
jest.mock('@/app/(auth)/actions', () => ({
  signOut: jest.fn(async () => {}),
}));

const mockUsePathname = usePathname as jest.Mock;
const mockedSignOut = signOut as jest.Mock;

describe('FleetNav', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/fleet');
    jest.clearAllMocks();
  });

  it('renders the same three destinations in both the desktop sidebar and the mobile bottom bar', () => {
    render(<FleetNav />);

    const dashboardLinks = screen.getAllByRole('link', { name: /dashboard/i });
    const driverLinks = screen.getAllByRole('link', { name: /drivers/i });
    const revenueLinks = screen.getAllByRole('link', { name: /revenue/i });

    expect(dashboardLinks).toHaveLength(2);
    expect(driverLinks).toHaveLength(2);
    expect(revenueLinks).toHaveLength(2);
  });

  it('only links to routes that exist: /fleet, /fleet/drivers, /fleet/revenue, plus the brand link home', () => {
    render(<FleetNav />);
    const links = screen.getAllByRole('link');
    const hrefs = links.map((link) => link.getAttribute('href'));
    expect(hrefs.every((href) => href !== null)).toBe(true);
    expect(new Set(hrefs)).toEqual(
      new Set(['/', '/fleet', '/fleet/drivers', '/fleet/revenue']),
    );
  });

  it('renders the KmerCargo brand as a link back to the landing page, once for the desktop sidebar and once for the mobile header', () => {
    render(<FleetNav />);
    const brandLinks = screen.getAllByRole('link', { name: 'KmerCargo' });
    expect(brandLinks).toHaveLength(2);
    brandLinks.forEach((link) => expect(link).toHaveAttribute('href', '/'));
  });

  it('renders the brand at the smaller "sm" size, in both the sidebar and the mobile header, matching the original fleet-nav treatment', () => {
    render(<FleetNav />);
    const brandLinks = screen.getAllByRole('link', { name: 'KmerCargo' });
    brandLinks.forEach((link) => {
      expect(link.querySelector('svg')).toHaveClass('h-5', 'w-5');
    });
    screen.getAllByText('KmerCargo').forEach((wordmark) => {
      expect(wordmark).toHaveClass('text-xl');
    });
  });

  it('carries the brand link in a slim mobile-only top header (md:hidden), so phones get it too — not just the desktop sidebar (hidden md:flex)', () => {
    render(<FleetNav />);
    const mobileHeader = screen.getByRole('banner');
    expect(mobileHeader).toHaveClass('md:hidden');
    expect(mobileHeader).not.toHaveClass('hidden');
    expect(
      within(mobileHeader).getByRole('link', { name: 'KmerCargo' }),
    ).toHaveAttribute('href', '/');
  });

  it('marks /fleet as the active route via aria-current when on the dashboard', () => {
    mockUsePathname.mockReturnValue('/fleet');
    render(<FleetNav />);
    const activeLinks = screen.getAllByRole('link', { current: 'page' });
    // One in the sidebar, one in the bottom bar.
    expect(activeLinks).toHaveLength(2);
    activeLinks.forEach((link) =>
      expect(link).toHaveAttribute('href', '/fleet'),
    );
  });

  it('marks /fleet/drivers as the active route via aria-current when on the drivers screen', () => {
    mockUsePathname.mockReturnValue('/fleet/drivers');
    render(<FleetNav />);
    const activeLinks = screen.getAllByRole('link', { current: 'page' });
    expect(activeLinks).toHaveLength(2);
    activeLinks.forEach((link) =>
      expect(link).toHaveAttribute('href', '/fleet/drivers'),
    );
  });

  it('marks /fleet/revenue as the active route via aria-current when on the revenue screen', () => {
    mockUsePathname.mockReturnValue('/fleet/revenue');
    render(<FleetNav />);
    const activeLinks = screen.getAllByRole('link', { current: 'page' });
    expect(activeLinks).toHaveLength(2);
    activeLinks.forEach((link) =>
      expect(link).toHaveAttribute('href', '/fleet/revenue'),
    );
  });

  it('marks no route active on an unrelated pathname', () => {
    mockUsePathname.mockReturnValue('/fleet/something-else');
    render(<FleetNav />);
    expect(screen.queryAllByRole('link', { current: 'page' })).toHaveLength(0);
  });

  it('gives every icon a visible text label', () => {
    render(<FleetNav />);
    ['Dashboard', 'Drivers', 'Revenue'].forEach((label) => {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    });
  });

  // Deleting a JSX element loses no branch, so coverage alone can't catch
  // a vanished control — assert it renders directly. There was previously
  // no way to log out of the fleet portal at all.
  describe('sign out', () => {
    it('renders a working "Sign out" control in both the desktop sidebar and the mobile header, once each', () => {
      render(<FleetNav />);
      const buttons = screen.getAllByRole('button', { name: /sign out/i });
      expect(buttons).toHaveLength(2);
    });

    it('submits the signOut server action when activated', async () => {
      render(<FleetNav />);
      const [button] = screen.getAllByRole('button', { name: /sign out/i });
      fireEvent.click(button);
      await waitFor(() => expect(mockedSignOut).toHaveBeenCalled());
    });

    it('pairs the sign-out icon with a visible text label and marks the icon decorative', () => {
      render(<FleetNav />);
      screen.getAllByRole('button', { name: /sign out/i }).forEach((button) => {
        expect(button).toHaveTextContent('Sign out');
        const icon = button.querySelector('svg');
        expect(icon).not.toBeNull();
        expect(icon).toHaveAttribute('aria-hidden', 'true');
      });
    });

    it('uses rounded-xl on the sign-out buttons', () => {
      render(<FleetNav />);
      screen.getAllByRole('button', { name: /sign out/i }).forEach((button) => {
        expect(button.className).toMatch(/rounded-xl/);
      });
    });
  });
});
