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
});
