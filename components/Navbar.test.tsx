import { render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import type { UserSummary } from '@/lib/api/types';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

const mockUsePathname = usePathname as jest.Mock;

function makeUser(overrides: Partial<UserSummary> = {}): UserSummary {
  return {
    id: 'user-1',
    phone_number: '+237674628817',
    role: 'fleet_owner',
    full_name: 'Admin User',
    profile_photo: null,
    is_active: true,
    date_joined: '2026-08-06T23:18:00.134979Z',
    ...overrides,
  };
}

describe('Navbar', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/');
  });

  it('renders the KmerCargo brand as a link back to the landing page', () => {
    render(<Navbar user={null} />);
    expect(screen.getByRole('link', { name: 'KmerCargo' })).toHaveAttribute(
      'href',
      '/',
    );
  });

  it.each([
    ['Registration', '/register'],
    ['Support', '/contact'],
    ['Help', '/help'],
  ])('links %s to %s', (label, href) => {
    render(<Navbar user={null} />);
    expect(screen.getByRole('link', { name: label })).toHaveAttribute(
      'href',
      href,
    );
  });

  describe('signed out (or a resolved-null user, e.g. an expired/invalid token)', () => {
    it('shows Get Started linking to /register and no dashboard link', () => {
      render(<Navbar user={null} />);
      expect(screen.getByRole('link', { name: 'Get Started' })).toHaveAttribute(
        'href',
        '/register',
      );
      expect(
        screen.queryByRole('link', { name: /dashboard/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe('signed in as a fleet owner', () => {
    it('shows a dashboard link to /fleet with an accessible name including "Dashboard"', () => {
      const user = makeUser({ role: 'fleet_owner', full_name: 'Ama Owusu' });
      render(<Navbar user={user} />);

      expect(
        screen.queryByRole('link', { name: 'Get Started' }),
      ).not.toBeInTheDocument();
      const link = screen.getByRole('link', { name: /dashboard/i });
      expect(link).toHaveAttribute('href', '/fleet');
      expect(link).toHaveTextContent('Ama Owusu');
    });

    it("shows initials derived from the user's name in the avatar", () => {
      const user = makeUser({ role: 'fleet_owner', full_name: 'Ama Owusu' });
      render(<Navbar user={user} />);
      expect(screen.getByText('AO')).toBeInTheDocument();
    });

    it('falls back to the formatted phone number, in font-mono, when full_name is empty', () => {
      const user = makeUser({ role: 'fleet_owner', full_name: '' });
      render(<Navbar user={user} />);

      const link = screen.getByRole('link', { name: /dashboard/i });
      expect(link).toHaveTextContent('+237 6 74 62 88 17');
      expect(screen.getByText('+237 6 74 62 88 17')).toHaveClass('font-mono');
    });

    it('renders the last two digits of the phone number as the avatar initials when full_name is empty', () => {
      // +237674628817 -> digits-only "237674628817" -> last two: "17".
      // Pinned explicitly so a wrong slice (e.g. the country code, or the
      // first two digits) fails loudly instead of shipping at 100%
      // coverage — the display-name and font-mono assertions above don't
      // touch this value at all.
      const user = makeUser({ role: 'fleet_owner', full_name: '' });
      render(<Navbar user={user} />);

      expect(screen.getByText('17')).toBeInTheDocument();
    });
  });

  describe('signed in as an admin', () => {
    it('shows a dashboard link to /admin with an accessible name including "Dashboard"', () => {
      const user = makeUser({ role: 'admin', full_name: 'Admin User' });
      render(<Navbar user={user} />);

      const link = screen.getByRole('link', { name: /dashboard/i });
      expect(link).toHaveAttribute('href', '/admin');
      expect(link).toHaveTextContent('Admin User');
    });
  });

  describe('an unexpected role reaching the dashboard link', () => {
    it('defends by routing to /fleet rather than guessing silently', () => {
      // getCurrentUser only ever resolves fleet_owner/admin users into
      // this component, but the prop type doesn't statically guarantee
      // that. Prove the fallback is deliberate, not an accident, by
      // exercising it directly.
      const user = makeUser({
        role: 'customer' as UserSummary['role'],
        full_name: 'Someone',
      });
      render(<Navbar user={user} />);

      expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute(
        'href',
        '/fleet',
      );
    });
  });

  describe('active page indicator', () => {
    const ALL_LABELS = ['Registration', 'Support', 'Help'];

    it.each([
      ['/register', 'Registration'],
      ['/contact', 'Support'],
      ['/help', 'Help'],
      ['/register/fleet', 'Registration'],
    ])(
      'marks the right nav link active with aria-current="page" when on %s',
      (pathname, activeLabel) => {
        mockUsePathname.mockReturnValue(pathname);
        render(<Navbar user={null} />);

        ALL_LABELS.forEach((label) => {
          const link = screen.getByRole('link', { name: label });
          if (label === activeLabel) {
            expect(link).toHaveAttribute('aria-current', 'page');
          } else {
            expect(link).not.toHaveAttribute('aria-current');
          }
        });
      },
    );

    it('marks no nav link active on the root path, rather than matching everything', () => {
      mockUsePathname.mockReturnValue('/');
      render(<Navbar user={null} />);

      ALL_LABELS.forEach((label) => {
        expect(screen.getByRole('link', { name: label })).not.toHaveAttribute(
          'aria-current',
        );
      });
    });
  });
});
