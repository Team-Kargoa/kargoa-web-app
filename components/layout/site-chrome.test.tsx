import { render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { SiteChrome } from './site-chrome';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

const mockUsePathname = usePathname as jest.Mock;

describe('SiteChrome', () => {
  it('renders the navbar and page content, without a footer, on a marketing route', () => {
    mockUsePathname.mockReturnValue('/');

    render(
      <SiteChrome>
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
      <SiteChrome>
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
        <SiteChrome>
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
      <SiteChrome>
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
        <SiteChrome>
          <p>fleet content</p>
        </SiteChrome>,
      );

      expect(screen.queryByRole('banner')).not.toBeInTheDocument();
      expect(screen.getByText('fleet content')).toBeInTheDocument();
    },
  );
});
