import { render, screen } from '@testing-library/react';
import Navbar from './Navbar';
import type { UserSummary } from '@/lib/api/types';

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
  it('renders the KmerCargo brand as a link back to the landing page', () => {
    render(<Navbar user={null} />);
    expect(screen.getByRole('link', { name: 'KmerCargo' })).toHaveAttribute(
      'href',
      '/',
    );
  });

  it.each([
    ['Registration', '/register'],
    ['Support', '/support'],
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
});
