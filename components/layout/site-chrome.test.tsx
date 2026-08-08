import { render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { SiteChrome } from './site-chrome';
import type { UserSummary } from '@/lib/api/types';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

const mockUsePathname = usePathname as jest.Mock;

const FLEET_OWNER: UserSummary = {
  id: 'user-1',
  phone_number: '+237674628817',
  role: 'fleet_owner',
  full_name: 'Ama Owusu',
  profile_photo: null,
  is_active: true,
  date_joined: '2026-08-06T23:18:00.134979Z',
};

describe('SiteChrome', () => {
  it('renders the navbar and page content, without a footer, on a marketing route', () => {
    mockUsePathname.mockReturnValue('/');

    render(
      <SiteChrome user={null}>
        <p>page content</p>
      </SiteChrome>,
    );

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByText('page content')).toBeInTheDocument();
    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument();
  });

  it('renders only the page content on an admin route', () => {
    mockUsePathname.mockReturnValue('/admin');

    render(
      <SiteChrome user={null}>
        <p>admin content</p>
      </SiteChrome>,
    );

    expect(screen.queryByRole('banner')).not.toBeInTheDocument();
    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument();
    expect(screen.getByText('admin content')).toBeInTheDocument();
  });

  it.each(['/signin', '/register/fleet', '/verify'])(
    'renders only the page content on the auth route %s, which supplies its own header',
    (pathname) => {
      mockUsePathname.mockReturnValue(pathname);

      render(
        <SiteChrome user={null}>
          <p>auth content</p>
        </SiteChrome>,
      );

      expect(screen.queryByRole('banner')).not.toBeInTheDocument();
      expect(screen.getByText('auth content')).toBeInTheDocument();
    },
  );

  it('still renders the navbar on the partner registration hub at /register', () => {
    mockUsePathname.mockReturnValue('/register');

    render(
      <SiteChrome user={null}>
        <p>hub content</p>
      </SiteChrome>,
    );

    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it.each(['/fleet', '/fleet/drivers', '/fleet/revenue'])(
    'renders only the page content on the fleet owner route %s, which supplies its own navigation',
    (pathname) => {
      mockUsePathname.mockReturnValue(pathname);

      render(
        <SiteChrome user={null}>
          <p>fleet content</p>
        </SiteChrome>,
      );

      expect(screen.queryByRole('banner')).not.toBeInTheDocument();
      expect(screen.getByText('fleet content')).toBeInTheDocument();
    },
  );

  // Both onboarding forms (app/onboarding/business, app/onboarding/vehicle)
  // render their own fixed OnboardingHeader — the same bug already fixed
  // for /fleet, missed here, stacked the marketing Navbar on top of it.
  it.each(['/onboarding/business', '/onboarding/vehicle'])(
    'renders only the page content on the onboarding route %s, which supplies its own header',
    (pathname) => {
      mockUsePathname.mockReturnValue(pathname);

      render(
        <SiteChrome user={null}>
          <p>onboarding content</p>
        </SiteChrome>,
      );

      expect(screen.queryByRole('banner')).not.toBeInTheDocument();
      expect(screen.getByText('onboarding content')).toBeInTheDocument();
    },
  );

  // CHROMELESS_ROUTES used bare pathname.startsWith(route), so a future
  // route sharing a prefix (e.g. /fleets alongside /fleet) would wrongly
  // lose its navbar. /fleetops is a stand-in for that shape today: it
  // starts with /fleet but is not /fleet or nested under it, so it must
  // keep the navbar, matching components/Navbar.tsx's isNavLinkActive rule.
  it("keeps the navbar on a route that merely starts with a chromeless route's name, e.g. /fleetops", () => {
    mockUsePathname.mockReturnValue('/fleetops');

    render(
      <SiteChrome user={null}>
        <p>fleetops content</p>
      </SiteChrome>,
    );

    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('threads a signed-in user down into the navbar so it can show their dashboard link', () => {
    mockUsePathname.mockReturnValue('/');

    render(
      <SiteChrome user={FLEET_OWNER}>
        <p>page content</p>
      </SiteChrome>,
    );

    expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute(
      'href',
      '/fleet',
    );
    expect(
      screen.queryByRole('link', { name: 'Get Started' }),
    ).not.toBeInTheDocument();
  });
});
